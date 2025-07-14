import { Injectable } from "@nestjs/common";
import { Repository, DataSource, Not } from "typeorm";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

import { GameStatusEnum } from "../enums/gameStatus.enum";
import { GameQuestion } from "../entity/gameQuestions.entity.typeorm";
import { GetPlayerByUserIdType } from "./types/GetPlayerByUserIdType";
import { Question } from "../../questions/entity/question.entity.typeorm";
import { Game, GAME_QUESTIONS_COUNT } from "../entity/game.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { getRandomNumbersFromRange } from "../helpers/getRandomNumbersFromRange";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";
import { GetGameQuestionsWithAnswersByPlayerId } from "./types/GetGameQuestionsWithAnswersByPlayerId";
import { GameToFinishQueryType } from "../application/types/gameToFinishType";

@Injectable()
export class GamesRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Game) private gameEntity: Repository<Game>,
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
    const query = `
        SELECT g.id
         FROM game g
         LEFT JOIN player p1
            ON g."firstPlayerId" = p1.id
         LEFT JOIN player p2
            ON g."secondPlayerId" = p2.id
         WHERE (p1."userAccountId" = $1 OR p2."userAccountId" = $1)
            AND g."status" != $2
    `;

    try {
      const res = await this.dataSource.query(query, [
        userId,
        GameStatusEnum.Finished,
      ]);
      return res?.[0];
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

  async getActiveGameByGameId(gameId: string): Promise<Game | null> {
    const query = `
        SELECT *
        FROM game
        WHERE id = $1
    `;

    try {
      const res = await this.dataSource.query(query, [gameId]);
      return res?.[0];
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
      const playersQuery = `
        SELECT 
            p1.id as "firstPlayerId",
            p1."userAccountId" as "firstPlayerUserId",
            p2.id as "secondPlayerId",
            p2."userAccountId" as "secondPlayerUserId"
        FROM game g
        LEFT JOIN player p1
            ON g."firstPlayerId" = p1.id
        LEFT JOIN player p2
            ON g."secondPlayerId" = p2.id
        WHERE (p1."userAccountId" = $1 OR p2."userAccountId" = $1)
            AND g."status" = $2
            AND p1.id IS NOT NULL
            AND p2.id IS NOT NULL
    `;

      const playersRes = await this.dataSource.query(playersQuery, [
        userId,
        GameStatusEnum.Active,
      ]);
      const players = playersRes?.[0];

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

      const currentPlayerQuery = `
        SELECT 
            p.id,
            p.score,
            (
                SELECT jsonb_agg(
                            json_build_object(
                                'questionId', pa."questionId",
                                'answerStatus', pa."status",
                                'addedAt', pa."addedAt"
                            )
                       )
                FROM player_answers pa
                WHERE pa."playerId" = p."id"
            ) as "answers"
        FROM player p
        WHERE p.id = $1
    `;
      const currentPlayerRes = await this.dataSource.query(currentPlayerQuery, [
        currentPlayerId,
      ]);

      return {
        currentPlayer: currentPlayerRes?.[0],
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
            gameId: gameWithFirstPlayer.id,
            questionId: availableQuestionIds[fiveRandomQuestionIndexes[i]].id,
          });
          await gameQuestionEntityWithQR.save(newGameQuestion);
        }

        // Add 2nd player to the game
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

  async getActiveGamesWhereOnePlayerAnsweredToAllQuestions(): Promise<
    GameToFinishQueryType[] | null
  > {
    const query = `
        SELECT *
        FROM
          (SELECT 
              g.id,
              g."firstPlayerId",
              g."secondPlayerId",

              (SELECT COUNT (*)
               FROM player_answers
               WHERE "playerId" = g."firstPlayerId"
              ) as "firstPlayerAnswersCount",
              
              (SELECT COUNT (*)
               FROM player_answers
               WHERE "playerId" = g."secondPlayerId"
              ) as "secondPlayerAnswersCount",
              
              (SELECT MAX("addedAt")
               FROM player_answers
               WHERE "playerId" = g."firstPlayerId"
              ) as "firstPlayerLastAnswerDate",
              
              (SELECT MAX("addedAt")
               FROM player_answers
               WHERE "playerId" = g."secondPlayerId"
              ) as "secondPlayerLastAnswerDate",
              
              (SELECT jsonb_agg("questionId")
               FROM player_answers
               WHERE "playerId" = g."firstPlayerId"
              ) as "firstPlayerQuestionIds",
              
              (SELECT jsonb_agg("questionId")
               FROM player_answers
               WHERE "playerId" = g."secondPlayerId"
              ) as "secondPlayerQuestionIds"
              
           FROM game g
           WHERE g.status = $1
          ) as "activeGames"
        WHERE "firstPlayerAnswersCount" = $2 OR "secondPlayerAnswersCount" = $2
    `;

    try {
      return this.dataSource.query(query, [
        GameStatusEnum.Active,
        GAME_QUESTIONS_COUNT,
      ]);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get games from db",
        extensions: [
          {
            field: "",
            message: "Failed to get games from db",
          },
        ],
      });
    }
  }
}
