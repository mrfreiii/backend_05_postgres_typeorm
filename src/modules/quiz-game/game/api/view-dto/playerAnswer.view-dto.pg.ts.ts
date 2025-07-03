import { PlayerAnswers } from "../../entity/playerAnswers.entity.typeorm";

export class PlayerAnswerViewDtoTypeorm {
  questionId: string;
  answerStatus: string;
  addedAt: string;

  static mapToView(answer: PlayerAnswers): PlayerAnswerViewDtoTypeorm {
    const viewAnswer = new PlayerAnswerViewDtoTypeorm();

    viewAnswer.questionId = answer.questionId;
    viewAnswer.answerStatus = answer.status;
    viewAnswer.addedAt = answer.addedAt;

    return viewAnswer;
  }
}
