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

    if (!currentPlayer || !anotherPlayerId) {
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
    const gameQuestions =
      await this.gamesRepository.getGameQuestionsWithAnswersByPlayerId(
        currentPlayer.id,
      );
    const playerAnswersIds =
      currentPlayer.answers?.map((a) => a.questionId) || [];
    const currentQuestion = gameQuestions?.questionsWithAnswers.find(
      (q) => !playerAnswersIds.includes(q.questionId),
    );

    // Checking answer and saving result
    const isCurrentAnswerCorrect =
      currentQuestion?.questionAnswers.includes(playerAnswer);

    const newAnswer = this.playerAnswersEntity.create({
      playerId: currentPlayer.id,
      questionId: currentQuestion?.questionId,
      status: isCurrentAnswerCorrect
        ? AnswerStatusEnum.Correct
        : AnswerStatusEnum.Incorrect,
    });
    await this.playerAnswersRepository.save_player_answer_typeorm(newAnswer);

    // Calculating score
    const currentPlayerForUpdate =
      await this.playersRepository.getPlayerById_typeorm(currentPlayer.id);
    const anotherPlayerAnswersCount =
      await this.playerAnswersRepository.getAnotherPlayerAnswersCount_typeorm(
        anotherPlayerId,
      );

    let newScore = currentPlayerForUpdate?.score || 0;
    if (isCurrentAnswerCorrect) {
      newScore += 1;
    }

    const isLastAnswer =
      currentPlayer?.answers?.length === GAME_QUESTIONS_COUNT - 1;
    // Add additional point if current player answered faster to all questions and has min 1 point already
    if (
      isLastAnswer &&
      anotherPlayerAnswersCount < GAME_QUESTIONS_COUNT &&
      newScore > 0
    ) {
      newScore += 1;
    }

    currentPlayerForUpdate!.score = newScore;
    await this.playersRepository.save_player_typeorm(currentPlayerForUpdate!);

    // Finish game if both players answer to all questions
    if (isLastAnswer && anotherPlayerAnswersCount === GAME_QUESTIONS_COUNT) {
      const game = await this.gamesRepository.getActiveGameIdByUserId(userId);

      game!.finishGameDate = new Date().toISOString();
      await this.gamesRepository.save_game_typeorm(game!);
    }

    return newAnswer.id;
  }
}
