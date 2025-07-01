import { IsBoolean } from "class-validator";

export class UpdatePublishedStatusInputDto {
  @IsBoolean()
  published: boolean;
}
