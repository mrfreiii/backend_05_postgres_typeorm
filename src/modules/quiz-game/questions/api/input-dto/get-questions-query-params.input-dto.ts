import { IsEnum, IsOptional, IsString } from "class-validator";

import { QuestionsSortBy } from "./questions-sort-by";
import { QuestionPublishedStatusEnum } from "../../enums/questions.enum";
import { BaseQueryParams } from "../../../../../core/dto/base.query-params.input-dto";

export class GetQuestionsQueryParams extends BaseQueryParams {
  @IsOptional()
  sortBy = QuestionsSortBy.CreatedAt;

  @IsString()
  @IsOptional()
  bodySearchTerm: string | null = null;

  @IsEnum(QuestionPublishedStatusEnum)
  publishedStatus: QuestionPublishedStatusEnum =
    QuestionPublishedStatusEnum.All;
}
