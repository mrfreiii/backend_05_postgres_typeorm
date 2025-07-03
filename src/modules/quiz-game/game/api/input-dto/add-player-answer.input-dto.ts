import { IsString } from "class-validator";

export class AddPlayerAnswerInputDto {
  @IsString()
  answer: string;
}
