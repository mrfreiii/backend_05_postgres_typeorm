import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RateLimit } from "./entity/rateLimit.entity.typeorm";
import { RateLimitRepository } from "./infrastructure/rateLimit.repository";

@Module({
  imports: [TypeOrmModule.forFeature([RateLimit])],
  controllers: [],
  providers: [RateLimitRepository],
  exports: [RateLimitRepository, TypeOrmModule.forFeature([RateLimit])],
})
export class RateLimitModule {}
