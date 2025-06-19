import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { CoreConfig } from "../../../core/config/core.config";
import { RateLimit } from "../entity/rateLimit.entity.typeorm";
import { DomainException } from "../../../core/exceptions/domain-exceptions";
import { RateLimitRepository } from "../infrastructure/rateLimit.repository";
import { DomainExceptionCode } from "../../../core/exceptions/domain-exception-codes";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private coreConfig: CoreConfig,
    private rateLimitRepository: RateLimitRepository,
    @InjectRepository(RateLimit) private rateLimitEntity: Repository<RateLimit>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.coreConfig.rateLimitEnabled) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const url = req.originalUrl;
    const ip = req.ip || "unknown ip";
    const date = Date.now();

    const dateForSearch = date - this.coreConfig.rateLimitPeriodInSec * 1000;
    const sameRequestCount =
      await this.rateLimitRepository.getRequestCount_typeorm({
        url,
        ip: ip!,
        date: dateForSearch,
      });

    if (sameRequestCount > this.coreConfig.rateLimitRequestsInPeriod - 1) {
      throw new DomainException({
        code: DomainExceptionCode.TooManyRequests,
        message: "Too many requests",
        extensions: [
          {
            field: "",
            message: "Too many requests",
          },
        ],
      });
    }

    const newRequest = this.rateLimitEntity.create({
      url,
      ip,
      date,
    });
    await this.rateLimitRepository.addRequest_typeorm(newRequest);

    return true;
  }
}
