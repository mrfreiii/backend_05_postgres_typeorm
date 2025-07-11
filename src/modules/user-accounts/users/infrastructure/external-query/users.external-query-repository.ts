import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { UserAccount } from "../../entity/user.entity.typeorm";
import { UserViewDtoPg } from "../../api/view-dto/users.view-dto.pg";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectRepository(UserAccount) private userEntity: Repository<UserAccount>,
  ) {}

  async getByIdOrNotFoundFail_typeorm(id: string): Promise<UserViewDtoPg> {
    try {
      const user = await this.userEntity.findOne({
        where: { id },
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

      return UserViewDtoPg.mapToView(user);
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "User not found",
        extensions: [
          {
            field: "",
            message: "User not found",
          },
        ],
      });
    }
  }
}
