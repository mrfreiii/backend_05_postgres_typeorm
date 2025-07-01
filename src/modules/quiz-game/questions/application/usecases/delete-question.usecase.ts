import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionsRepository } from "../../infrastructure/questions.repository";

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionCommandHandler
  implements ICommandHandler<DeleteQuestionCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ id }: DeleteQuestionCommand): Promise<void> {
    await this.questionsRepository.findOrNotFoundFail_typeorm(id);

    await this.questionsRepository.deletedQuestion_typeorm(id);
  }
}
