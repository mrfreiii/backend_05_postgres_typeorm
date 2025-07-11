import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

import { SETTINGS } from "../../settings";
import { RateLimit } from "../rateLimit/entity/rateLimit.entity.typeorm";
import { UserAccount } from "../user-accounts/users/entity/user.entity.typeorm";
import { DomainException } from "../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../core/exceptions/domain-exception-codes";
import { UserRegistration } from "../user-accounts/users/entity/registation.entity.typeorm";
import { UserPasswordRecovery } from "../user-accounts/users/entity/passwordRecovery.entity.typeorm";
import { LikeStatus } from "../bloggers-platform/likes/entity/likes.entity.typeorm";

@Controller(SETTINGS.PATH.TESTING)
export class TestingController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(RateLimit) private rateLimitEntity: Repository<RateLimit>,
    @InjectRepository(UserAccount) private userEntity: Repository<UserAccount>,
    @InjectRepository(LikeStatus)
    private likeStatusEntity: Repository<LikeStatus>,
    @InjectRepository(UserRegistration)
    private userRegistrationEntity: Repository<UserRegistration>,
    @InjectRepository(UserPasswordRecovery)
    private userPasswordRecoveryEntity: Repository<UserPasswordRecovery>,
  ) {}

  @Delete("all-data")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const skipTables = ["migrations", this.likeStatusEntity.metadata.tableName];

    const allTables = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema='public' AND table_type='BASE TABLE'
    `);

    const allTableNames = allTables
      .map((table: { table_name: string }) => table.table_name)
      .filter((name: string) => !skipTables.includes(name));

    // get deadlock when truncate in parallel
    // const promises = allTables
    //   .map((table: { table_name: string }) => table.table_name)
    //   .filter((name: string) => !skipTables.includes(name))
    //   .map((name: string) => {
    //     const query = `TRUNCATE TABLE "${name}" RESTART IDENTITY CASCADE;`;
    //
    //     return this.dataSource.query(query);
    //   });

    try {
      for (let i = 0; i < allTableNames.length; i++) {
        await this.dataSource.query(`
           TRUNCATE TABLE "${allTableNames[i]}" RESTART IDENTITY CASCADE;
        `);
      }
      // await Promise.all(promises); // get deadlock when truncate in parallel

      return {
        status: "succeeded",
      };
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to truncate tables",
        extensions: [
          {
            field: "",
            message: "Failed to truncate tables",
          },
        ],
      });
    }
  }

  @Delete("rate-limits")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRateLimit() {
    await this.rateLimitEntity.clear();

    return {
      status: "succeeded",
    };
  }

  @Get("registration-code/:email")
  async getRegistrationCodeByEmail(@Param("email") email: string) {
    try {
      const user = await this.userEntity.findOne({
        where: { email },
      });
      if (!user) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: "User not found",
          extensions: [
            {
              field: "",
              message: "User not found",
            },
          ],
        });
      }

      const registrationInfo = await this.userRegistrationEntity.findOne({
        where: { userAccountId: user.id },
      });
      if (!registrationInfo) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: "User registration info not found",
          extensions: [
            {
              field: "",
              message: "User registration info not found",
            },
          ],
        });
      }

      return { code: registrationInfo.confirmationCode };
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get user registration confirmation code",
        extensions: [
          {
            field: "",
            message: "Failed to get user registration confirmation code",
          },
        ],
      });
    }
  }

  @Get("password-recovery-code/:email")
  async getPasswordRecoveryCodeByEmail(@Param("email") email: string) {
    try {
      const user = await this.userEntity.findOne({
        where: { email },
      });

      if (!user) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: "User not found",
          extensions: [
            {
              field: "",
              message: "User not found",
            },
          ],
        });
      }

      const passwordRecoveryInfo =
        await this.userPasswordRecoveryEntity.findOne({
          where: { userAccountId: user.id },
        });
      if (!passwordRecoveryInfo) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: "User password recovery info not found",
          extensions: [
            {
              field: "",
              message: "User password recovery info not found",
            },
          ],
        });
      }

      return { code: passwordRecoveryInfo.recoveryCode };
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get user password recovery code",
        extensions: [
          {
            field: "",
            message: "Failed to get user password recovery code",
          },
        ],
      });
    }
  }
}
