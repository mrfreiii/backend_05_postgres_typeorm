import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Question } from "./questions/entity/question.entity.typeorm";
import { QuestionsRepository } from "./questions/infrastructure/questions.repository";
import { QuestionsQueryRepository } from "./questions/infrastructure/query/questions.query-repository";

import { DeleteQuestionCommandHandler } from "./questions/application/usecases/delete-question.usecase";
import { CreateQuestionCommandHandler } from "./questions/application/usecases/create-question.usecase";
import { UpdateQuestionCommandHandler } from "./questions/application/usecases/update-question.usecase";
import { UpdatePublishedStatusCommandHandler } from "./questions/application/usecases/update-published-status.usecase";

const commandHandlers = [
  CreateQuestionCommandHandler,
  DeleteQuestionCommandHandler,
  UpdateQuestionCommandHandler,
  UpdatePublishedStatusCommandHandler,
];

const controllers = [];

const services = [];

const repos = [QuestionsRepository, QuestionsQueryRepository];

const typeorm_entities = [Question];

@Module({
  imports: [
    // UserAccountsModule,
    TypeOrmModule.forFeature([...typeorm_entities]),
  ],
  controllers: [...controllers],
  providers: [...commandHandlers, ...services, ...repos],
  exports: [TypeOrmModule.forFeature([...typeorm_entities])],
})
export class QuizGameModule {}
