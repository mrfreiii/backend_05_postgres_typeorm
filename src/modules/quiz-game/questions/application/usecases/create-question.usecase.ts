import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { Question } from "../../entity/question.entity.typeorm";
import { QuestionsRepository } from "../../infrastructure/questions.repository";
import { CreateQuestionInputDto } from "../../api/input-dto/create-question.input-dto";

export class CreateQuestionCommand {
  constructor(public dto: CreateQuestionInputDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionCommandHandler
  implements ICommandHandler<CreateQuestionCommand, string>
{
  constructor(
    private questionsRepository: QuestionsRepository,
    @InjectRepository(Question) private questionEntity: Repository<Question>,
  ) {}

  async execute({ dto }: CreateQuestionCommand): Promise<string> {
    const newQuestion = this.questionEntity.create({
      body: dto.body,
      correctAnswers: dto.correctAnswers,
      published: false,
    });

    return this.questionsRepository.save_question_typeorm(newQuestion);
  }
}
