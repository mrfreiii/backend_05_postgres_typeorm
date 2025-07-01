import {
  Put,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiBasicAuth } from "@nestjs/swagger";

import { SETTINGS } from "../../../../settings";
import { BasicAuthGuard } from "../../../user-accounts/guards/basic/basic-auth.guard";
import { QuestionsQueryRepository } from "../infrastructure/query/questions.query-repository";

import { QuestionViewDto } from "./view-dto/questions.view-dto";
import { CreateQuestionInputDto } from "./input-dto/create-question.input-dto";
import { UpdateQuestionInputDto } from "./input-dto/update-question.input-dto";
import { PaginatedViewDto } from "../../../../core/dto/base.paginated.view-dto";
import { GetQuestionsQueryParams } from "./input-dto/get-questions-query-params.input-dto";
import { UpdatePublishedStatusInputDto } from "./input-dto/update-published-status.input-dto";

import { CreateQuestionCommand } from "../application/usecases/create-question.usecase";
import { DeleteQuestionCommand } from "../application/usecases/delete-question.usecase";
import { UpdateQuestionCommand } from "../application/usecases/update-question.usecase";
import { UpdatePublishedStatusCommand } from "../application/usecases/update-published-status.usecase";

@Controller(SETTINGS.PATH.QUESTIONS_ADMIN)
@UseGuards(BasicAuthGuard)
@ApiBasicAuth("basicAuth")
export class QuestionsAdminController {
  constructor(
    private commandBus: CommandBus,
    private questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @Post()
  async createQuestionUser(
    @Body() body: CreateQuestionInputDto,
  ): Promise<QuestionViewDto> {
    const questionId = await this.commandBus.execute(
      new CreateQuestionCommand(body),
    );

    return this.questionsQueryRepository.getByIdOrNotFoundFail_typeorm(
      questionId,
    );
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param("id") id: string,
    @Body() body: UpdateQuestionInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateQuestionCommand({ questionId: id, inputData: body }),
    );
  }

  @Put(":id/publish")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePublishedStatus(
    @Param("id") id: string,
    @Body() body: UpdatePublishedStatusInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePublishedStatusCommand({
        questionId: id,
        published: body.published,
      }),
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param("id") id: string): Promise<void> {
    return this.commandBus.execute(new DeleteQuestionCommand(id));
  }

  @Get()
  async getAll(
    @Query() query: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    return this.questionsQueryRepository.getAll_typeorm(query);
  }
}
