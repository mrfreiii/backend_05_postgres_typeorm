import { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from "@nestjs/common";

import { SETTINGS } from "../../settings";
import { DomainException } from "../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../core/exceptions/domain-exception-codes";

@Controller(SETTINGS.PATH.TESTING)
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Delete("all-data")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const allTables = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema='public' AND table_type='BASE TABLE'
    `);

    const promises = allTables
      .map((table: { table_name: string }) => table.table_name)
      .map((name: string) => {
        const query = `
         TRUNCATE TABLE "${name}" RESTART IDENTITY CASCADE;
        `;

        return this.dataSource.query(query);
      });

    try {
      await Promise.all(promises);

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

  // @Get("registration-code/:email")
  // async getRegistrationCodeByEmail(@Param("email") email: string) {
  //   const userQuery = `
  //      SELECT * FROM ${SETTINGS.TABLES.USERS} WHERE "email" = $1
  //   `;
  //
  //   try {
  //     const userResponse = await this.dataSource.query(userQuery, [email]);
  //     const user = userResponse[0];
  //
  //     if (!user) {
  //       throw new DomainException({
  //         code: DomainExceptionCode.NotFound,
  //         message: "User not found",
  //         extensions: [
  //           {
  //             field: "",
  //             message: "User not found",
  //           },
  //         ],
  //       });
  //     }
  //
  //     const codeQuery = `
  //      SELECT * FROM ${SETTINGS.TABLES.USERS_REGISTRATION_INFO} WHERE "userId" = $1
  //   `;
  //
  //     const codeResponse = await this.dataSource.query(codeQuery, [user.id]);
  //     return { code: codeResponse[0].confirmationCode };
  //   } catch {
  //     throw new DomainException({
  //       code: DomainExceptionCode.InternalServerError,
  //       message: "Failed to get user registration confirmation code",
  //       extensions: [
  //         {
  //           field: "",
  //           message: "Failed to get user registration confirmation code",
  //         },
  //       ],
  //     });
  //   }
  // }

  // @Get("password-recovery-code/:email")
  // async getPasswordRecoveryCodeByEmail(@Param("email") email: string) {
  //   const userQuery = `
  //      SELECT * FROM ${SETTINGS.TABLES.USERS} WHERE "email" = $1
  //   `;
  //
  //   try {
  //     const userResponse = await this.dataSource.query(userQuery, [email]);
  //     const user = userResponse[0];
  //
  //     if (!user) {
  //       throw new DomainException({
  //         code: DomainExceptionCode.NotFound,
  //         message: "User not found",
  //         extensions: [
  //           {
  //             field: "",
  //             message: "User not found",
  //           },
  //         ],
  //       });
  //     }
  //
  //     const codeQuery = `
  //      SELECT * FROM ${SETTINGS.TABLES.USERS_PASSWORD_RECOVERY_INFO} WHERE "userId" = $1
  //   `;
  //
  //     const codeResponse = await this.dataSource.query(codeQuery, [user.id]);
  //     return { code: codeResponse[0].recoveryCode };
  //   } catch {
  //     throw new DomainException({
  //       code: DomainExceptionCode.InternalServerError,
  //       message: "Failed to get user password recovery code",
  //       extensions: [
  //         {
  //           field: "",
  //           message: "Failed to get user password recovery code",
  //         },
  //       ],
  //     });
  //   }
  // }

  // @Delete("rate-limits")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteRateLimit() {
  //   const query = `TRUNCATE TABLE ${SETTINGS.TABLES.RATE_LIMIT}`;
  //   await this.dataSource.query(query);
  //
  //   return {
  //     status: "succeeded",
  //   };
  // }
}
