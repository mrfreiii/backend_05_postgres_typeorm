import { add } from "date-fns";
import { Repository } from "typeorm";
import { Interval } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { GameStatusEnum } from "../enums/gameStatus.enum";
import { AnswerStatusEnum } from "../enums/answerStatus.enum";
import { GamesRepository } from "../infrastructure/games.repository";
import { GAME_QUESTIONS_COUNT } from "../entity/game.entity.typeorm";
import { PlayerAnswers } from "../entity/playerAnswers.entity.typeorm";
import { PlayersRepository } from "../infrastructure/players.repository";
import { PlayerGameResultStatusEnum } from "../enums/playerGameResultStatus.enum";
import { PlayerAnswersRepository } from "../infrastructure/playerAnswers.repository";

const FINISH_GAME_IN_SECONDS: number = 8;

@Injectable()
export class GameScheduleService {
  #gamesInProcess: string[] = [];

  constructor(
    private gamesRepository: GamesRepository,
    @InjectRepository(PlayerAnswers)
    private playerAnswersEntity: Repository<PlayerAnswers>,
    private playerAnswersRepository: PlayerAnswersRepository,
    private playersRepository: PlayersRepository,
  ) {}

  // @Cron("* * * * * *") // every second
  @Interval(1000) // every second
  async finishGameIn10secWhenOnePlayerAnsweredToAllQuestions() {
    const games =
      await this.gamesRepository.getActiveGamesWhereOnePlayerAnsweredToAllQuestions();

    if (games && games?.length > 0) {
      for (let i = 0; i < games?.length; i++) {
        const game = games[i];

        let finishedPlayerId: string;
        let finishedPlayerLastAnswerDate: string;

        let notFinishedPlayerId: string;

        let allQuestionIds: string[];
        let notFinishedPlayerQuestionIds: string[];

        if (Number(game.firstPlayerAnswersCount) === GAME_QUESTIONS_COUNT) {
          finishedPlayerId = game.firstPlayerId;
          finishedPlayerLastAnswerDate = game.firstPlayerLastAnswerDate;

          notFinishedPlayerId = game.secondPlayerId;

          allQuestionIds = game.firstPlayerQuestionIds;
          notFinishedPlayerQuestionIds = game.secondPlayerQuestionIds || [];
        } else {
          finishedPlayerId = game.secondPlayerId;
          finishedPlayerLastAnswerDate = game.secondPlayerLastAnswerDate;

          notFinishedPlayerId = game.firstPlayerId;

          allQuestionIds = game.secondPlayerQuestionIds;
          notFinishedPlayerQuestionIds = game.firstPlayerQuestionIds || [];
        }

        const lastAnswerDatePlus10sec = add(
          new Date(finishedPlayerLastAnswerDate),
          {
            seconds: FINISH_GAME_IN_SECONDS,
          },
        );

        // Passed more than 10 sec after last answer
        if (lastAnswerDatePlus10sec < new Date()) {
          // Finish game
          const gameForUpdate =
            await this.gamesRepository.getActiveGameByGameId(game.id);

          if (gameForUpdate) {
            gameForUpdate.status = GameStatusEnum.Finished;
            gameForUpdate.finishGameDate = new Date().toISOString();

            await this.gamesRepository.save_game_typeorm(gameForUpdate);

            // Add incorrect answers for notFinished player for all not answered questions
            for (let j = 0; j < allQuestionIds.length; j++) {
              if (!notFinishedPlayerQuestionIds.includes(allQuestionIds[j])) {
                const newAnswer = this.playerAnswersEntity.create({
                  playerId: notFinishedPlayerId,
                  questionId: allQuestionIds[j],
                  addedAt: new Date().toISOString(),
                  status: AnswerStatusEnum.Incorrect,
                });

                await this.playerAnswersRepository.save_player_answer_typeorm(
                  newAnswer,
                );
              }
            }

            const finishedPlayerForUpdate =
              await this.playersRepository.getPlayerById_typeorm(
                finishedPlayerId,
              );
            const notFinishedPlayerForUpdate =
              await this.playersRepository.getPlayerById_typeorm(
                notFinishedPlayerId,
              );

            // Add 1 score for finished player if he has more than 1 score
            if (
              finishedPlayerForUpdate!.score > 0 &&
              finishedPlayerForUpdate!.status === null
            ) {
              finishedPlayerForUpdate!.score += 1;
            }

            // Determine who is winner
            if (
              finishedPlayerForUpdate!.score > notFinishedPlayerForUpdate!.score
            ) {
              finishedPlayerForUpdate!.status = PlayerGameResultStatusEnum.Win;
              notFinishedPlayerForUpdate!.status =
                PlayerGameResultStatusEnum.Lose;
            }

            if (
              notFinishedPlayerForUpdate!.score > finishedPlayerForUpdate!.score
            ) {
              notFinishedPlayerForUpdate!.status =
                PlayerGameResultStatusEnum.Win;
              finishedPlayerForUpdate!.status = PlayerGameResultStatusEnum.Lose;
            }

            if (
              notFinishedPlayerForUpdate!.score ===
              finishedPlayerForUpdate!.score
            ) {
              notFinishedPlayerForUpdate!.status =
                PlayerGameResultStatusEnum.Draw;
              finishedPlayerForUpdate!.status = PlayerGameResultStatusEnum.Draw;
            }

            // Save both players
            await this.playersRepository.save_player_typeorm(
              finishedPlayerForUpdate!,
            );
            await this.playersRepository.save_player_typeorm(
              notFinishedPlayerForUpdate!,
            );
          }
        }
      }
    }
  }

  private _checkIfGameAlreadyInProcess(gameId: string): boolean {
    return this.#gamesInProcess.includes(gameId);
  }

  private _addGameToProcessing(gameId: string): void {
    this.#gamesInProcess.push(gameId);
  }

  private _deleteGameFromProcessing(gameId: string): void {
    this.#gamesInProcess = this.#gamesInProcess.filter((id) => id !== gameId);
  }
}
