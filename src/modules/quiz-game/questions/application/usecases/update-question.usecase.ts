import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionsRepository } from "../../infrastructure/questions.repository";
import { UpdateQuestionInputDto } from "../../api/input-dto/update-question.input-dto";

export class UpdateQuestionCommand {
  constructor(
    public dto: { questionId: string; inputData: UpdateQuestionInputDto },
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionCommandHandler
  implements ICommandHandler<UpdateQuestionCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ dto }: UpdateQuestionCommand): Promise<void> {
    const { questionId, inputData } = dto;

    const question =
      await this.questionsRepository.findOrNotFoundFail_typeorm(questionId);

    question.body = inputData.body;
    question.correctAnswers = inputData.correctAnswers;

    await this.questionsRepository.save_question_typeorm(question);
  }
}
