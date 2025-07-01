import { Question } from "../../entity/question.entity.typeorm";

export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;

  static mapToView(question: Question): QuestionViewDto {
    const viewQuestion = new QuestionViewDto();

    viewQuestion.id = question.id;
    viewQuestion.body = question.body;
    viewQuestion.correctAnswers = question.correctAnswers;
    viewQuestion.published = question.published;
    viewQuestion.createdAt = question.createdAt;
    viewQuestion.updatedAt = question.updatedAt;

    return viewQuestion;
  }
}
