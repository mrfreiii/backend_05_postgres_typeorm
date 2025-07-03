import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";

import {
  GameQueryRepoType,
  GameViewDtoTypeorm,
} from "../../api/view-dto/game.view-dto.pg";
import { Game } from "../../entity/game.entity.typeorm";
import { GameQuestion } from "../../entity/gameQuestions.entity.typeorm";
import { PlayerAnswers } from "../../entity/playerAnswers.entity.typeorm";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class GamesQueryRepository {
  constructor(
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
        .leftJoin("firstPlayer.user", "firstPlayerUser")
        .leftJoin("secondPlayer.user", "secondPlayerUser")
        .select([
          'game.id as "id"',
          'game.status as "status"',
          'game.pairCreatedDate as "pairCreatedDate"',
          'game.startGameDate as "startGameDate"',
          'game.finishGameDate as "finishGameDate"',
          'firstPlayer.score as "firstPlayerScore"',
          'firstPlayer.userId as "firstPlayerUserId"',
          'firstPlayerUser.login as "firstPlayerUserLogin"',
          'secondPlayer.score as "secondPlayerScore"',
          'secondPlayer.userId as "secondPlayerUserId"',
          'secondPlayerUser.login as "secondPlayerUserLogin"',
        ])
        .addSelect(
          (sb) =>
            sb
              .select(
                `jsonb_agg(
                            json_build_object(
                                'questionId', pa."questionId", 
                                'answerStatus', pa."status", 
                                'addedAt', pa."addedAt"
                            )
                         )`,
              )
              .from(PlayerAnswers, "pa")
              .where('pa."playerId" = firstPlayer.id'),
          "firstPlayerAnswers",
        )
        .addSelect(
          (sb) =>
            sb
              .select(
                `jsonb_agg(
                            json_build_object(
                                'questionId', pa."questionId", 
                                'answerStatus', pa."status", 
                                'addedAt', pa."addedAt"
                            )
                         )`,
              )
              .from(PlayerAnswers, "pa")
              .where('pa."playerId" = secondPlayer.id'),
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
}
