import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { DataSource, Repository } from "typeorm";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

import {
  GameQueryRepoType,
  GameViewDtoTypeorm,
} from "../../api/view-dto/game.view-dto.pg";
import { Game } from "../../entity/game.entity.typeorm";
import { GameQuestion } from "../../entity/gameQuestions.entity.typeorm";
import { PlayerAnswers } from "../../entity/playerAnswers.entity.typeorm";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { GetGamesQueryParams } from "../../api/input-dto/get-games-query-params.input-dto";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { GamesSortBy } from "../../api/input-dto/games-sort-by";

@Injectable()
export class GamesQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Game)
    private gameEntity: Repository<GameQueryRepoType>,
  ) {}

  async getByIdOrNotFoundFail_typeorm(
    gameId: string,
  ): Promise<GameViewDtoTypeorm> {
    if (!isValidUUID(gameId)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Game not found",
        extensions: [
          {
            field: "",
            message: "Game not found",
          },
        ],
      });
    }

    let game: GameQueryRepoType | null | undefined;

    try {
      game = await this.gameEntity
        .createQueryBuilder("game")
        .leftJoin("game.firstPlayer", "firstPlayer")
        .leftJoin("game.secondPlayer", "secondPlayer")
        .leftJoin("firstPlayer.userAccount", "firstPlayerUser")
        .leftJoin("secondPlayer.userAccount", "secondPlayerUser")
        .select([
          'game.id as "id"',
          'game.status as "status"',
          'game.pairCreatedDate as "pairCreatedDate"',
          'game.startGameDate as "startGameDate"',
          'game.finishGameDate as "finishGameDate"',
          'firstPlayer.score as "firstPlayerScore"',
          'firstPlayer.userAccountId as "firstPlayerUserId"',
          'firstPlayerUser.login as "firstPlayerUserLogin"',
          'secondPlayer.score as "secondPlayerScore"',
          'secondPlayer.userAccountId as "secondPlayerUserId"',
          'secondPlayerUser.login as "secondPlayerUserLogin"',
        ])
        .addSelect(
          (sb) =>
            sb
              .select(
                `jsonb_agg(
                            json_build_object(
                                'questionId', aggregated_pa."id", 
                                'answerStatus', aggregated_pa."status", 
                                'addedAt', aggregated_pa."addedAt"
                            )
                         )`,
              )
              .from(
                (sb) =>
                  sb
                    .select([
                      'pa."questionId" as "id"',
                      'pa.status as "status"',
                      'pa."addedAt" as "addedAt"',
                    ])
                    .from(PlayerAnswers, "pa")
                    .where('pa."playerId" = firstPlayer.id')
                    .orderBy('pa."questionId"', "DESC"),
                "aggregated_pa",
              ),
          "firstPlayerAnswers",
        )
        .addSelect(
          (sb) =>
            sb
              .select(
                `jsonb_agg(
                            json_build_object(
                                'questionId', aggregated_pa."id", 
                                'answerStatus', aggregated_pa."status", 
                                'addedAt', aggregated_pa."addedAt"
                            )
                         )`,
              )
              .from(
                (sb) =>
                  sb
                    .select([
                      'pa."questionId" as "id"',
                      'pa.status as "status"',
                      'pa."addedAt" as "addedAt"',
                    ])
                    .from(PlayerAnswers, "pa")
                    .where('pa."playerId" = secondPlayer.id')
                    .orderBy('pa."questionId"', "DESC"),
                "aggregated_pa",
              ),
          "secondPlayerAnswers",
        )
        .addSelect(
          (sb) =>
            sb
              .select(
                `jsonb_agg(
                            json_build_object(
                                'id', aggregated_gq.id, 
                                'body', aggregated_gq.body
                            )
                         )`,
              )
              .from(
                (sb) =>
                  sb
                    .select(['gq."questionId" as "id"', 'gqq.body as "body"'])
                    .from(GameQuestion, "gq")
                    .leftJoin("gq.question", "gqq")
                    .where('gq."gameId" = game.id')
                    .orderBy('gq."questionId"', "DESC"),
                "aggregated_gq",
              ),
          "questions",
        )
        .where("game.id = :gameId", { gameId })
        .getRawOne();
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get game from db",
        extensions: [
          {
            field: "",
            message: "Failed to get game from db",
          },
        ],
      });
    }

    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Game not found",
        extensions: [
          {
            field: "",
            message: "Game not found",
          },
        ],
      });
    }

    return GameViewDtoTypeorm.mapToView(game);
  }

  async getAll_typeorm(dto: {
    requestParams: GetGamesQueryParams;
    userId: string;
  }): Promise<PaginatedViewDto<GameViewDtoTypeorm[]>> {
    const { requestParams, userId } = dto;

    const countQuery = `
        SELECT COUNT(*)
        FROM game g
        LEFT JOIN player p1
            ON g."firstPlayerId" = p1.id
        LEFT JOIN player p2
            ON g."secondPlayerId" = p2.id
        WHERE (p1."userAccountId" = $1 OR p2."userAccountId" = $1)
    `;

    let dataQuery = `
        SELECT 
            g.id,
            g.status,
            g."pairCreatedDate",
            g."startGameDate",
            g."finishGameDate",
            p1."score" as "firstPlayerScore",
            p1."userAccountId" as "firstPlayerUserId",
            u1."login" as "firstPlayerUserLogin",
            p2."score" as "secondPlayerScore",
            p2."userAccountId" as "secondPlayerUserId",
            u2."login" as "secondPlayerUserLogin",
            (
                SELECT jsonb_agg(
                            json_build_object(
                                'questionId', aggregated_pa."id",
                                'answerStatus', aggregated_pa."status",
                                'addedAt', aggregated_pa."addedAt"
                            )
                       )
                FROM (
                         SELECT 
                            pa."questionId" as "id",
                            pa."status",
                            pa."addedAt"
                         FROM player_answers pa
                         WHERE pa."playerId" = p1.id
                         ORDER BY pa."questionId" DESC
                     ) aggregated_pa
            ) as "firstPlayerAnswers",
            (
                SELECT jsonb_agg(
                            json_build_object(
                                'questionId', aggregated_pa."id",
                                'answerStatus', aggregated_pa."status",
                                'addedAt', aggregated_pa."addedAt"
                            )
                       )
                FROM (
                         SELECT 
                            pa."questionId" as "id",
                            pa."status",
                            pa."addedAt"
                         FROM player_answers pa
                         WHERE pa."playerId" = p2.id
                         ORDER BY pa."questionId" DESC
                     ) aggregated_pa
            ) as "secondPlayerAnswers",
            (
                SELECT jsonb_agg(
                            json_build_object(
                               'id', aggregated_gq.id,
                               'body', aggregated_gq.body
                            )
                       )
                FROM (
                         SELECT 
                            gq."questionId" as "id",
                            q.body
                         FROM game_question gq
                         LEFT JOIN question q
                            ON gq."questionId" = q.id
                         WHERE gq."gameId" = g.id
                         ORDER BY gq."questionId" DESC
                     ) aggregated_gq
            ) as "questions"
        FROM game g
        LEFT JOIN player p1
            ON g."firstPlayerId" = p1.id
        LEFT JOIN player p2
            ON g."secondPlayerId" = p2.id
        LEFT JOIN user_account u1
            ON p1."userAccountId" = u1.id
        LEFT JOIN user_account u2
            ON p2."userAccountId" = u2.id
        WHERE (p1."userAccountId" = $1 OR p2."userAccountId" = $1)
    `;

    if (requestParams.sortBy === GamesSortBy.PairCreatedDate) {
      dataQuery = `
        ${dataQuery}
        ORDER BY g."pairCreatedDate" ${requestParams.sortDirection}
      `;
    } else {
      dataQuery = `
        ${dataQuery}
        ORDER BY g."${requestParams.sortBy}" ${requestParams.sortDirection}, g."pairCreatedDate" DESC
      `;
    }

    try {
      const totalCountRes = await this.dataSource.query(countQuery, [userId]);

      const games = await this.dataSource.query(
        `
        ${dataQuery}
        LIMIT ${requestParams.pageSize}
        OFFSET ${requestParams.calculateSkip()}
      `,
        [userId],
      );

      const items = games.map(GameViewDtoTypeorm.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount: Number(totalCountRes[0].count),
        page: requestParams.pageNumber,
        size: requestParams.pageSize,
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Failed to get all games",
        extensions: [
          {
            field: "",
            message: "Failed to get all games",
          },
        ],
      });
    }
  }
}
