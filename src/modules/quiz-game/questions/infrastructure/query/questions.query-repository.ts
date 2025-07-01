import { ILike, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Question } from "../../entity/question.entity.typeorm";
import { QuestionViewDto } from "../../api/view-dto/questions.view-dto";
import { QuestionPublishedStatusEnum } from "../../enums/questions.enum";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { GetQuestionsQueryParams } from "../../api/input-dto/get-questions-query-params.input-dto";

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question) private questionEntity: Repository<Question>,
  ) {}

  async getByIdOrNotFoundFail_typeorm(id: string): Promise<QuestionViewDto> {
    try {
      const question = await this.questionEntity.findOne({
        where: { id },
      });

      if (!question) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: "Question not found",
          extensions: [
            {
              field: "",
              message: "Question not found",
            },
          ],
        });
      }

      return QuestionViewDto.mapToView(question);
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Question not found",
        extensions: [
          {
            field: "",
            message: "Question not found",
          },
        ],
      });
    }
  }

  async getAll_typeorm(
    requestParams: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const whereOptions: Record<any, any>[] = [];

    if (requestParams.bodySearchTerm) {
      whereOptions.push({
        body: ILike(`%${requestParams.bodySearchTerm}%`),
      });
    }

    switch (requestParams.publishedStatus) {
      case QuestionPublishedStatusEnum.Published:
        whereOptions.push({
          published: true,
        });
        break;
      case QuestionPublishedStatusEnum.NotPublished:
        whereOptions.push({
          published: false,
        });
        break;
    }

    const questions = await this.questionEntity.find({
      where: [...whereOptions],
      order: {
        [requestParams.sortBy]: requestParams.convertSortDirection(
          requestParams.sortDirection,
        ),
      },
      take: requestParams.pageSize,
      skip: requestParams.calculateSkip(),
    });

    const totalCount = await this.questionEntity.count({
      where: [...whereOptions],
    });

    const items = questions.map(QuestionViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount: totalCount,
      page: requestParams.pageNumber,
      size: requestParams.pageSize,
    });
  }
}
