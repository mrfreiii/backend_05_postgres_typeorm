import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

import { Session } from "../../entity/session.entity.typeorm";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { SessionViewDto } from "../../api/view-dto/sessions.view-dto";

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Session) private sessionEntity: Repository<Session>,
  ) {}

  async getAllActiveSessions_typeorm(
    userId: string,
  ): Promise<SessionViewDto[]> {
    try {
      const sessions = await this.sessionEntity.find({
        where: {
          userId,
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
