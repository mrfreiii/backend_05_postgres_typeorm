import { Injectable } from "@nestjs/common";

import { MeViewDtoPg } from "../../../users/api/view-dto/users.view-dto.pg";
import { UsersRepository } from "../../../users/infrastructure/users.repository";

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async me_typeorm(userId: string): Promise<MeViewDtoPg> {
    const user = await this.usersRepository.findOrNotFoundFail_typeorm(userId);

    return MeViewDtoPg.mapToView(user);
  }
}
