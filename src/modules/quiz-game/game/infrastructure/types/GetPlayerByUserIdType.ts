import { AnswerStatusEnum } from "../../enums/answerStatus.enum";

type Answer = {
  questionId: string;
  answerStatus: AnswerStatusEnum;
  addedAt: string;
};

export type GetPlayerByUserIdType = {
  id: string;
  score: number;
  answers: Answer[];
};
