import { IsOptional } from "class-validator";

import { GamesSortBy } from "./games-sort-by";
import { BaseQueryParams } from "../../../../../core/dto/base.query-params.input-dto";

export class GetGamesQueryParams extends BaseQueryParams {
  @IsOptional()
  sortBy = GamesSortBy.PairCreatedDate;
}
