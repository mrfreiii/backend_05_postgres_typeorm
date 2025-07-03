import { GameStatusEnum } from "../../enums/gameStatus.enum";
import { AnswerStatusEnum } from "../../enums/answerStatus.enum";

export type GameQueryRepoType = {
  id: string;

  firstPlayerAnswers: PlayerAnswerType[];
  firstPlayerUserId: string;
  firstPlayerUserLogin: string;
  firstPlayerScore: number;

  secondPlayerAnswers: PlayerAnswerType[];
  secondPlayerUserId: string | null;
  secondPlayerUserLogin: string | null;
  secondPlayerScore: number | null;

  questions: GamaQuestionType[];
  status: GameStatusEnum;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
};

export type PlayerAnswerType = {
  questionId: string;
  answerStatus: AnswerStatusEnum;
  addedAt: string;
};

type PlayerProgressType = {
  answers: PlayerAnswerType[];
  player: {
    id: string;
    login: string;
  };
  score: number;
};

type GamaQuestionType = {
  id: string;
  body: string;
};

export class GameViewDtoTypeorm {
  id: string;
  firstPlayerProgress: PlayerProgressType;
  secondPlayerProgress: PlayerProgressType | null;
  questions: GamaQuestionType[] | null;
  status: GameStatusEnum;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;

  static mapToView(game: GameQueryRepoType): GameViewDtoTypeorm {
    const viewGame = new GameViewDtoTypeorm();

    viewGame.id = game.id;
    viewGame.firstPlayerProgress = {
      answers: game.firstPlayerAnswers,
      player: {
        id: game.firstPlayerUserId,
        login: game.firstPlayerUserLogin,
      },
      score: game.firstPlayerScore,
    };
    viewGame.secondPlayerProgress =
      game.status === GameStatusEnum.PendingSecondPlayer
        ? null
        : {
            answers: game.secondPlayerAnswers,
            player: {
              id: game.secondPlayerUserId!,
              login: game.secondPlayerUserLogin!,
            },
            score: game.secondPlayerScore!,
          };
    viewGame.questions =
      game.status === GameStatusEnum.PendingSecondPlayer
        ? null
        : game.questions;
    viewGame.status = game.status;
    viewGame.pairCreatedDate = game.pairCreatedDate;
    viewGame.startGameDate = game.startGameDate;
    viewGame.finishGameDate = game.finishGameDate;

    return viewGame;
  }
}
