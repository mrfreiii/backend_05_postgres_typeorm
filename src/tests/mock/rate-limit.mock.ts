import { Repository } from "typeorm";
import { ExecutionContext } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { CoreConfig } from "../../core/config/core.config";
import { RateLimitGuard } from "../../modules/rateLimit/guards/rate-limit.guard";
import { RateLimit } from "../../modules/rateLimit/entity/rateLimit.entity.typeorm";
import { RateLimitRepository } from "../../modules/rateLimit/infrastructure/rateLimit.repository";

export class RateLimitMock extends RateLimitGuard {
  constructor(
    coreConfig: CoreConfig,
    rateLimitRepository: RateLimitRepository,
    @InjectRepository(RateLimit) rateLimitEntity: Repository<RateLimit>,
  ) {
    super(coreConfig, rateLimitRepository, rateLimitEntity);
  }

  // eslint-disable-next-line
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return Promise.resolve(true);
  }
}
