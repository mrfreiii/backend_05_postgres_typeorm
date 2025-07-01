import { IsArray, IsString } from "class-validator";

import { questionConstraints } from "../../entity/question.entity.typeorm";
import { IsStringWithTrim } from "../../../../../core/decorators/validation/is-string-with-trim";

export class UpdateQuestionInputDto {
  @IsStringWithTrim(
    questionConstraints.minLength,
    questionConstraints.maxLength,
  )
  body: string;

  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];
}
