import { Type } from "class-transformer";
import { IsEnum, IsNumber } from "class-validator";

export enum SortDirection {
  Asc = "asc",
  Desc = "desc",
  Ascending = "ascending",
  Descending = "descending",
  PositiveNumber = 1,
  NegativeNumber = -1,
}

export class BaseQueryParams {
  @Type(() => Number)
  @IsNumber()
  pageNumber: number = 1;

  @IsNumber()
  @Type(() => Number)
  pageSize: number = 10;

  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }

  convertSortDirection(direction: SortDirection): "ASC" | "DESC" {
    switch (direction) {
      case SortDirection.Asc:
      case SortDirection.Ascending:
      case SortDirection.PositiveNumber:
        return "ASC";
      case SortDirection.Desc:
      case SortDirection.Descending:
      case SortDirection.NegativeNumber:
        return "DESC";
    }
  }
}
