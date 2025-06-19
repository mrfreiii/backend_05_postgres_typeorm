import { Injectable } from "@nestjs/common";
import { MoreThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { RateLimit } from "../entity/rateLimit.entity.typeorm";
import { GetRequestCountInputDto } from "./dto/get-requests-count.input-dto";
import { DomainException } from "../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../core/exceptions/domain-exception-codes";

@Injectable()
export class RateLimitRepository {
  constructor(
    @InjectRepository(RateLimit) private rateLimitEntity: Repository<RateLimit>,
  ) {}

  async getRequestCount_typeorm(dto: GetRequestCountInputDto): Promise<number> {
    const { url, ip, date } = dto;

    try {
      return this.rateLimitEntity.count({
        where: {
          url,
          ip,
          date: MoreThan(date),
        },
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to count requests",
        extensions: [
          {
            field: "",
            message: "Failed to count requests",
          },
        ],
      });
    }
  }

  async addRequest_typeorm(request: RateLimit) {
    try {
      await this.rateLimitEntity.save(request);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save request",
        extensions: [
          {
            field: "",
            message: "Failed to save request",
          },
        ],
      });
    }
  }
}
