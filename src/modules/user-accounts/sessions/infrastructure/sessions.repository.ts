import { Not, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";

import { Session } from "../entity/session.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(Session) private sessionEntity: Repository<Session>,
  ) {}

  async save_session_typeorm(session: Session) {
    try {
      await this.sessionEntity.save(session);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save a session",
        extensions: [
          {
            field: "",
            message: "Failed to save a session",
          },
        ],
      });
    }
  }

  async findBy_userId_deviceId_version_typeorm(dto: {
    userId: string;
    deviceId: string;
    version: number;
  }): Promise<Session | null> {
    const { userId, deviceId, version } = dto;

    try {
      return this.sessionEntity.findOne({
        where: {
          userId,
          deviceId,
          version,
        },
      });
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

  async deleteSession_typeorm(session: Session): Promise<void> {
    try {
      await this.sessionEntity.delete(session);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to delete session",
        extensions: [
          {
            field: "",
            message: "Failed to delete session",
          },
        ],
      });
    }
  }

  async findByDeviceId_typeorm(deviceId: string): Promise<Session | null> {
    if (!isValidUUID(deviceId)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Session not found",
        extensions: [
          {
            field: "",
            message: "Session not found",
          },
        ],
      });
    }

    try {
      return this.sessionEntity.findOne({
        where: {
          deviceId,
        },
      });
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

  async deleteAllOtherSessions_typeorm(dto: {
    currentDeviceId: string;
    userId: string;
  }): Promise<void> {
    const { userId, currentDeviceId } = dto;

    try {
      await this.sessionEntity.delete({
        userId,
        deviceId: Not(currentDeviceId),
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to delete sessions",
        extensions: [
          {
            field: "",
            message: "Failed to delete sessions",
          },
        ],
      });
    }
  }
}
