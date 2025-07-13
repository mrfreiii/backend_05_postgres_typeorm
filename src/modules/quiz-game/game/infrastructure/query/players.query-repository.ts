import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";

import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { PlayerGameResultStatusEnum } from "../../enums/playerGameResultStatus.enum";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { GamesStatisticViewDtoTypeorm } from "../../api/view-dto/games-statistic.view-dto.pg";
import { AllGamesStatisticViewDtoTypeorm } from "../../api/view-dto/games-all-user-statistic.view-dto.pg";
import { GetAllGamesStatisticQueryParamsInputDto } from "../../api/input-dto/get-all-games-statistic-query-params.input-dto";

@Injectable()
export class PlayersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getStatistic_typeorm(
    userId: string,
  ): Promise<GamesStatisticViewDtoTypeorm> {
    const commonQuery = `
        SELECT 
            SUM("score") as "sumScore",
            COUNT(*) as "gamesCount"
        FROM player
        WHERE "userAccountId" = $1
    `;

    const statusQuery = `
        SELECT COUNT(*)
        FROM player
        WHERE "userAccountId" = $1 
            AND "status" = $2
    `;

    try {
      const common = await this.dataSource.query(commonQuery, [userId]);

      const wins = await this.dataSource.query(statusQuery, [
        userId,
        PlayerGameResultStatusEnum.Win,
      ]);
      const losses = await this.dataSource.query(statusQuery, [
        userId,
        PlayerGameResultStatusEnum.Lose,
      ]);
      const draws = await this.dataSource.query(statusQuery, [
        userId,
        PlayerGameResultStatusEnum.Draw,
      ]);

      return GamesStatisticViewDtoTypeorm.mapToView({
        ...common[0],
        winsCount: wins[0].count,
        lossesCount: losses[0].count,
        drawsCount: draws[0].count,
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get game stat from db",
        extensions: [
          {
            field: "",
            message: "Failed to get game stat from db",
          },
        ],
      });
    }
  }

  async getAllGamesStatistic_typeorm(
    requestParams: GetAllGamesStatisticQueryParamsInputDto,
  ): Promise<PaginatedViewDto<AllGamesStatisticViewDtoTypeorm>> {
    const countQuery = `
        SELECT COUNT(users.*) FROM 
        (
            SELECT u.id
            FROM user_account u
            LEFT JOIN player p
                ON p."userAccountId" = u.id
            WHERE p.id IS NOT NULL
            GROUP BY u.id
        ) as users;
    `;

    const dataQuery = `
        SELECT
           u.id as "playerId",
           u.login as "playerLogin",
           (
                SELECT SUM("score")
                FROM player
                WHERE "userAccountId" = u.id
           ) as "sumScore",
           (
                SELECT COUNT(*)
                FROM player
                WHERE "userAccountId" = u.id
           ) as "gamesCount",
           (
                SELECT 1.0 *
                  (SELECT SUM("score") FROM player
                   WHERE "userAccountId" = u.id)
                  / 
                  (SELECT COUNT(*) FROM player
                   WHERE "userAccountId" = u.id)
           ) as "avgScores",
           (
                SELECT COUNT(*)
                FROM player
                WHERE "userAccountId" = u.id 
                AND "status" = '${PlayerGameResultStatusEnum.Win}'
           ) as "winsCount",
           (
                SELECT COUNT(*)
                FROM player
                WHERE "userAccountId" = u.id 
                AND "status" = '${PlayerGameResultStatusEnum.Lose}'
           ) as "lossesCount",
           (
                SELECT COUNT(*)
                FROM player
                WHERE "userAccountId" = u.id 
                AND "status" = '${PlayerGameResultStatusEnum.Draw}'
           ) as "drawsCount"
        FROM user_account u
        LEFT JOIN player p
            ON u.id = p."userAccountId" 
        WHERE p.id IS NOT NULL
        GROUP BY u.id
        ORDER BY ${requestParams.convertSort(requestParams.sort)}
        LIMIT ${requestParams.pageSize}
        OFFSET ${requestParams.calculateSkip()}
    `;

    try {
      const totalCountRes = await this.dataSource.query(countQuery);
      const stats = await this.dataSource.query(dataQuery);

      const items = stats.map(AllGamesStatisticViewDtoTypeorm.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount: Number(totalCountRes[0].count),
        page: requestParams.pageNumber,
        size: requestParams.pageSize,
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get all games stats from db",
        extensions: [
          {
            field: "",
            message: "Failed to get all games stats from db",
          },
        ],
      });
    }
  }
}
