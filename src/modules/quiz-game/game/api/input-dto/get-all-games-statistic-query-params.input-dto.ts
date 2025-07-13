import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

import { BaseQueryParams } from "../../../../../core/dto/base.query-params.input-dto";

export class GetAllGamesStatisticQueryParamsInputDto extends BaseQueryParams {
  @Type(() => Number)
  @IsNumber()
  pageNumber: number = 1;

  @IsNumber()
  @Type(() => Number)
  pageSize: number = 10;

  @IsOptional()
  sort = ["avgScores desc", "sumScore desc"];

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }

  convertSort(sort: string[] | string): string {
    if (typeof sort === "string") {
      const direction = sort.split(" ")[1] ?? "DESC";

      return `"${sort.split(" ")[0]}" ${direction}`;
    }

    return sort
      .map((s) => `"${s.split(" ")[0]}" ${s.split(" ")[1]}`)
      .join(", ");
  }
}
