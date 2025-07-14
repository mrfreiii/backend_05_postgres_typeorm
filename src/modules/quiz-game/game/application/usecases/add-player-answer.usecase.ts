import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { AnswerStatusEnum } from "../../enums/answerStatus.enum";
import { GamesRepository } from "../../infrastructure/games.repository";
import { GAME_QUESTIONS_COUNT } from "../../entity/game.entity.typeorm";
import { PlayerAnswers } from "../../entity/playerAnswers.entity.typeorm";
import { PlayersRepository } from "../../infrastructure/players.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { PlayerAnswersRepository } from "../../infrastructure/playerAnswers.repository";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { GameStatusEnum } from "../../enums/gameStatus.enum";
import { PlayerGameResultStatusEnum } from "../../enums/playerGameResultStatus.enum";

export class AddPlayerAnswerCommand {
  constructor(public dto: { userId: string; playerAnswer: string }) {}
}

@CommandHandler(AddPlayerAnswerCommand)
export class AddPlayerAnswerCommandHandler
  implements ICommandHandler<AddPlayerAnswerCommand, string>
{
  constructor(
    private gamesRepository: GamesRepository,
    private playerAnswersRepository: PlayerAnswersRepository,
    @InjectRepository(PlayerAnswers)
    private playerAnswersEntity: Repository<PlayerAnswers>,
    private playersRepository: PlayersRepository,
  ) {}

  async execute({ dto }: AddPlayerAnswerCommand): Promise<string> {
    const { userId, playerAnswer } = dto;

    const players = await this.gamesRepository.getPlayerByUserId(userId);
    const { currentPlayer, anotherPlayerId } = players || {};

    if (!currentPlayer?.id || !anotherPlayerId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "There is no active game for current user",
        extensions: [
          {
            field: "",
            message: "There is no active game for current user",
          },
        ],
      });
    }

    if (currentPlayer?.answers?.length === GAME_QUESTIONS_COUNT) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "User already answer to all questions",
        extensions: [
          {
            field: "",
            message: "User already answer to all questions",
          },
        ],
      });
    }

    // Finding current question
    const allGameQuestions =
      await this.gamesRepository.getGameQuestionsWithAnswersByPlayerId(
        currentPlayer.id,
      );
    const playerAnswersIds =
      currentPlayer.answers?.map((a) => a.questionId) || [];
    const currentQuestion = allGameQuestions?.questionsWithAnswers.find(
      (q) => !playerAnswersIds.includes(q.questionId),
    );
    if (!currentQuestion?.questionId) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Can not calculate current game question",
        extensions: [
          {
            field: "",
            message: "Can not calculate current game question",
          },
        ],
      });
    }

    // Checking answer and saving result
    const isCurrentAnswerCorrect =
      currentQuestion?.questionAnswers.includes(playerAnswer);

    const newAnswer = this.playerAnswersEntity.create({
      playerId: currentPlayer.id,
      questionId: currentQuestion.questionId,
      addedAt: new Date().toISOString(),
      status: isCurrentAnswerCorrect
        ? AnswerStatusEnum.Correct
        : AnswerStatusEnum.Incorrect,
    });
    await this.playerAnswersRepository.save_player_answer_typeorm(newAnswer);

    // Add score for current player
    const currentPlayerForUpdate =
      await this.playersRepository.getPlayerById_typeorm(currentPlayer.id);

    if (isCurrentAnswerCorrect) {
      currentPlayerForUpdate!.score += 1;
    }

    // Add additional score for other player if all players answered to all questions,
    // and he answered the fastest and had score > 0
    const anotherPlayerForUpdate =
      await this.playersRepository.getPlayerById_typeorm(anotherPlayerId);
    const anotherPlayerAnswers =
      await this.playerAnswersRepository.getAnotherPlayerAnswers_typeorm(
        anotherPlayerId,
      );

    const isAllPlayersAnsweredToAllQuestions =
      currentPlayer?.answers?.length === GAME_QUESTIONS_COUNT - 1 &&
      anotherPlayerAnswers?.length === GAME_QUESTIONS_COUNT;
    const isAnotherPlayerAnsweredFastest =
      anotherPlayerAnswers?.length === GAME_QUESTIONS_COUNT &&
      new Date(
        anotherPlayerAnswers?.[GAME_QUESTIONS_COUNT - 1]?.addedAt,
      )?.getTime() < new Date(newAnswer.addedAt).getTime();

    if (
      isAllPlayersAnsweredToAllQuestions &&
      isAnotherPlayerAnsweredFastest &&
      anotherPlayerForUpdate!.score > 0
    ) {
      anotherPlayerForUpdate!.score += 10;
    }

    // Finish game if both players answer to all questions
    if (isAllPlayersAnsweredToAllQuestions) {
      const game = await this.gamesRepository.getActiveGameIdByUserId(userId);

      // In parallel answers the first player can finish game faster, then the 2nd player not need to finish game
      if (game) {
        game.status = GameStatusEnum.Finished;
        game.finishGameDate = new Date().toISOString();

        await this.gamesRepository.save_game_typeorm(game);
      }

      // Determine who is winner
      if (currentPlayerForUpdate!.score > anotherPlayerForUpdate!.score) {
        currentPlayerForUpdate!.status = PlayerGameResultStatusEnum.Win;
        anotherPlayerForUpdate!.status = PlayerGameResultStatusEnum.Lose;
      }

      if (anotherPlayerForUpdate!.score > currentPlayerForUpdate!.score) {
        anotherPlayerForUpdate!.status = PlayerGameResultStatusEnum.Win;
        currentPlayerForUpdate!.status = PlayerGameResultStatusEnum.Lose;
      }

      if (anotherPlayerForUpdate!.score === currentPlayerForUpdate!.score) {
        anotherPlayerForUpdate!.status = PlayerGameResultStatusEnum.Draw;
        currentPlayerForUpdate!.status = PlayerGameResultStatusEnum.Draw;
      }
    }

    // Save both players
    await this.playersRepository.save_player_typeorm(currentPlayerForUpdate!);
    await this.playersRepository.save_player_typeorm(anotherPlayerForUpdate!);

    return newAnswer.id;
  }
}
