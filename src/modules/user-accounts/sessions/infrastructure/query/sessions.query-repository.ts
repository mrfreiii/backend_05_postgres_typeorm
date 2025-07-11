import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Session } from "../../entity/session.entity.typeorm";
import { SessionViewDto } from "../../api/view-dto/sessions.view-dto";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectRepository(Session) private sessionEntity: Repository<Session>,
  ) {}

  async getAllActiveSessions_typeorm(
    userId: string,
  ): Promise<SessionViewDto[]> {
    try {
      const sessions = await this.sessionEntity.find({
        where: {
          userAccountId: userId,
        },
        order: {
          issuedAt: "asc",
        },
      });

      return sessions.map(SessionViewDto.mapToView);
      // const onlyActiveSessions = sessions.filter(
      //   (session) => new Date(session.expirationTime) > new Date(),
      // );
      //
      // return onlyActiveSessions.map(SessionViewDto.mapToView);
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get session from db",
        extensions: [
          {
            field: "",
            message: "Failed to get session from db",
          },
        ],
      });
    }
  }
}
