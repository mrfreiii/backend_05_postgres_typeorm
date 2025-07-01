import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionsRepository } from "../../infrastructure/questions.repository";

export class UpdatePublishedStatusCommand {
  constructor(public dto: { questionId: string; published: boolean }) {}
}

@CommandHandler(UpdatePublishedStatusCommand)
export class UpdatePublishedStatusCommandHandler
  implements ICommandHandler<UpdatePublishedStatusCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ dto }: UpdatePublishedStatusCommand): Promise<void> {
    const { questionId, published } = dto;

    const question =
      await this.questionsRepository.findOrNotFoundFail_typeorm(questionId);

    question.published = published;

    await this.questionsRepository.save_question_typeorm(question);
  }
}
