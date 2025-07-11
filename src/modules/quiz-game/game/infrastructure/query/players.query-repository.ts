import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";

import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { PlayerGameResultStatusEnum } from "../../enums/playerGameResultStatus.enum";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { GamesStatisticViewDtoTypeorm } from "../../api/view-dto/games-statistic.view-dto.pg";

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
}
