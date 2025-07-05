import { Injectable } from "@nestjs/common";
import { Repository, DataSource, Not } from "typeorm";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

import { Game, GAME_QUESTIONS_COUNT } from "../entity/game.entity.typeorm";
import { GameStatusEnum } from "../enums/gameStatus.enum";
import { GameQuestion } from "../entity/gameQuestions.entity.typeorm";
import { Question } from "../../questions/entity/question.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { getRandomNumbersFromRange } from "../helpers/getRandomNumbersFromRange";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";
import { PlayerAnswers } from "../entity/playerAnswers.entity.typeorm";
import { Player } from "../entity/player.entity.typeorm";
import { GetPlayerByUserIdType } from "./types/GetPlayerByUserIdType";
import { GetGameQuestionsWithAnswersByPlayerId } from "./types/GetGameQuestionsWithAnswersByPlayerId";

@Injectable()
export class GamesRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Game) private gameEntity: Repository<Game>,
    @InjectRepository(Player) private playerEntity: Repository<Player>,
    @InjectRepository(Question) private questionEntity: Repository<Question>,
  ) {}

  async save_game_typeorm(game: Game): Promise<void> {
    try {
      await this.gameEntity.save(game);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save game in db",
        extensions: [
          {
            field: "",
            message: "Failed to save game in db",
          },
        ],
      });
    }
  }

  async getActiveGameIdByUserId(userId: string): Promise<Game | null> {
    try {
      return this.gameEntity
        .createQueryBuilder("g")
        .leftJoin("g.firstPlayer", "fp")
        .leftJoin("g.secondPlayer", "sp")
        .select("g.id")
        .addSelect("g.status")
        .where("g.finishGameDate IS NULL")
        .andWhere("fp.userId = :userId OR sp.userId = :userId", { userId })
        .getOne();
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get game id from db",
        extensions: [
          {
            field: "",
            message: "Failed to get game id from db",
          },
        ],
      });
    }
  }

  async getPlayerByUserId(userId: string): Promise<{
    currentPlayer: GetPlayerByUserIdType | null | undefined;
    anotherPlayerId: string;
  } | null> {
    try {
      const players = await this.gameEntity
        .createQueryBuilder("g")
        .leftJoin("g.firstPlayer", "fp")
        .leftJoin("g.secondPlayer", "sp")
        .select([
          'fp.id as "firstPlayerId"',
          'fp."userId" as "firstPlayerUserId"',
          'sp.id as "secondPlayerId"',
          'sp."userId" as "secondPlayerUserId"',
        ])
        .where("fp.userId = :userId OR sp.userId = :userId", { userId })
        .andWhere("g.finishGameDate IS NULL")
        .andWhere("g.firstPlayerId IS NOT NULL")
        .andWhere("g.secondPlayerId IS NOT NULL")
        .getRawOne();

      let currentPlayerId = "";
      let anotherPlayerId = "";

      if (players && players.firstPlayerUserId === userId) {
        currentPlayerId = players.firstPlayerId;
        anotherPlayerId = players.secondPlayerId;
      }
      if (players && players.secondPlayerUserId === userId) {
        currentPlayerId = players.secondPlayerId;
        anotherPlayerId = players.firstPlayerId;
      }

      if (!currentPlayerId) {
        return null;
      }

      const currentPlayer = await this.playerEntity
        .createQueryBuilder("p")
        .select(['p.id as "id"', 'p.score as "score"'])
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
              .where('pa."playerId" = p.id'),
          "answers",
        )
        .where("p.id = :playerId", { playerId: currentPlayerId })
        .getRawOne();

      return {
        currentPlayer,
        anotherPlayerId,
      };
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get players from db",
        extensions: [
          {
            field: "",
            message: "Failed to get players from db",
          },
        ],
      });
    }
  }

  async getGameQuestionsWithAnswersByPlayerId(
    playerId: string,
  ): Promise<GetGameQuestionsWithAnswersByPlayerId | null | undefined> {
    try {
      return this.gameEntity
        .createQueryBuilder("g")
        .select(['g.id as "gameId"'])
        .addSelect(
          (sb) =>
            sb
              .select(
                `jsonb_agg(
                                json_build_object(
                                    'questionId', aggregated_gq.id,
                                    'questionBody', aggregated_gq.body,
                                    'questionAnswers', aggregated_gq."correctAnswers"
                                )
                             )`,
              )
              .from(
                (sb) =>
                  sb
                    .select([
                      'gq."questionId" as "id"',
                      'gqq.body as "body"',
                      'gqq."correctAnswers" as "correctAnswers"',
                    ])
                    .from(GameQuestion, "gq")
                    .leftJoin("gq.question", "gqq")
                    .where('gq."gameId" = g.id')
                    .orderBy('gq."questionId"', "DESC"),
                "aggregated_gq",
              ),
          "questionsWithAnswers",
        )
        .where("g.firstPlayerId = :playerId OR g.secondPlayerId = :playerId", {
          playerId,
        })
        .getRawOne();
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get game questions with answers from db",
        extensions: [
          {
            field: "",
            message: "Failed to get game questions with answers from db",
          },
        ],
      });
    }
  }

  async connectToGameOrCreateNewGame(newPlayerId: string): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const gameEntityWithQR = queryRunner.manager.getRepository(Game);
    const gameQuestionEntityWithQR =
      queryRunner.manager.getRepository(GameQuestion);

    try {
      const gameWithFirstPlayer = await gameEntityWithQR.findOne({
        where: {
          status: GameStatusEnum.PendingSecondPlayer,
          firstPlayerId: Not(newPlayerId),
        },
        lock: { mode: "pessimistic_write" },
      });

      // Connection Player to existing game
      if (gameWithFirstPlayer) {
        gameWithFirstPlayer.secondPlayerId = newPlayerId;
        gameWithFirstPlayer.status = GameStatusEnum.Active;
        gameWithFirstPlayer.startGameDate = new Date().toISOString();

        await gameEntityWithQR.save(gameWithFirstPlayer);
        await queryRunner.commitTransaction();

        return gameWithFirstPlayer.id;
      }

      // Creating new game if there is no one
      const newGame = gameEntityWithQR.create({
        firstPlayerId: newPlayerId,
        status: GameStatusEnum.PendingSecondPlayer,
      });
      await gameEntityWithQR.save(newGame);

      // Getting random questions for new game
      const availableQuestionIds = await this.questionEntity.find({
        where: { published: true },
        select: { id: true },
      });
      if (availableQuestionIds.length < GAME_QUESTIONS_COUNT) {
        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: `There is no enough published question in db for creating a game (need min ${GAME_QUESTIONS_COUNT})`,
          extensions: [
            {
              field: "",
              message: `There is no enough published question in db for creating a game (need min ${GAME_QUESTIONS_COUNT})`,
            },
          ],
        });
      }

      const fiveRandomQuestionIndexes = getRandomNumbersFromRange({
        count: 5,
        max: availableQuestionIds.length,
      });
      for (let i = 0; i < fiveRandomQuestionIndexes.length; i++) {
        const newGameQuestion = gameQuestionEntityWithQR.create({
          gameId: newGame.id,
          questionId: availableQuestionIds[fiveRandomQuestionIndexes[i]].id,
        });
        await gameQuestionEntityWithQR.save(newGameQuestion);
      }

      // Second check if another user created another game while current user created this game
      const secondCheckGameWithFirstPlayer = await gameEntityWithQR.findOne({
        where: {
          status: GameStatusEnum.PendingSecondPlayer,
          firstPlayerId: Not(newPlayerId),
        },
      });

      // If another game appeared then rollback transaction and repeat connection again
      if (secondCheckGameWithFirstPlayer) {
        await queryRunner.rollbackTransaction();
        return this.connectToGameOrCreateNewGame(newPlayerId);
      } else {
        await queryRunner.commitTransaction();
        return newGame.id;
      }
    } catch (e) {
      console.log(e);

      await queryRunner.rollbackTransaction();

      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed create a game or connect to game",
        extensions: [
          {
            field: "",
            message: "Failed create a game or connect to game",
          },
        ],
      });
    } finally {
      await queryRunner.release();
    }
  }
}
