export class GameToFinishQueryType {
  id: string;
  firstPlayerId: string;
  secondPlayerId: string;
  firstPlayerAnswersCount: string;
  secondPlayerAnswersCount: string;
  firstPlayerLastAnswerDate: string;
  secondPlayerLastAnswerDate: string;
  firstPlayerQuestionIds: string[];
  secondPlayerQuestionIds: string[];
}
