import { ILike, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { User } from "../../entity/user.entity.typeorm";
import { UserViewDtoPg } from "../../api/view-dto/users.view-dto.pg";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { GetUsersQueryParams } from "../../api/input-dto/get-users-query-params.input-dto";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectRepository(User) private userEntity: Repository<User>) {}

  async getByIdOrNotFoundFail_typeorm(id: string): Promise<UserViewDtoPg> {
    try {
      const user = await this.userEntity.findOne({
        where: { id },
      });

      if (!user) {
        throw new Error();
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

  async getAll_typeorm(
    requestParams: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDtoPg[]>> {
    const whereOptions: Record<any, any>[] = [];

    if (requestParams.searchLoginTerm) {
      whereOptions.push({
        login: ILike(`%${requestParams.searchLoginTerm}%`),
      });
    }

    if (requestParams.searchEmailTerm) {
      whereOptions.push({
        email: ILike(`%${requestParams.searchEmailTerm}%`),
      });
    }

    const users = await this.userEntity.find({
      where: [...whereOptions],
      order: {
        [requestParams.sortBy]: requestParams.sortDirection,
      },
      take: requestParams.pageSize,
      skip: requestParams.calculateSkip(),
    });

    const totalCount = await this.userEntity.count({
      where: [...whereOptions],
    });

    const items = users.map(UserViewDtoPg.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount: totalCount,
      page: requestParams.pageNumber,
      size: requestParams.pageSize,
    });
  }
}
