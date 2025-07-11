import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";

import { UserAccount } from "../entity/user.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";
import { UserRegistration } from "../entity/registation.entity.typeorm";
import { UserPasswordRecovery } from "../entity/passwordRecovery.entity.typeorm";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserAccount) private userEntity: Repository<UserAccount>,
    @InjectRepository(UserRegistration)
    private userRegistrationEntity: Repository<UserRegistration>,
    @InjectRepository(UserPasswordRecovery)
    private userPasswordRecoveryEntity: Repository<UserPasswordRecovery>,
  ) {}

  async save_user_typeorm(user: UserAccount) {
    try {
      const response = await this.userEntity.save(user);

      return response?.id;
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save user in db",
        extensions: [
          {
            field: "",
            message: "Failed to save user in db",
          },
        ],
      });
    }
  }

  async findByLogin_typeorm(login: string): Promise<UserAccount | null> {
    try {
      return this.userEntity.findOne({
        where: { login },
      });
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get user from db",
        extensions: [
          {
            field: "",
            message: "Failed to get user from db",
          },
        ],
      });
    }
  }

  async findByEmail_typeorm(email: string): Promise<UserAccount | null> {
    try {
      return this.userEntity.findOne({
        where: { email },
      });
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get user from db",
        extensions: [
          {
            field: "",
            message: "Failed to get user from db",
          },
        ],
      });
    }
  }

  async findOrNotFoundFail_typeorm(id: string): Promise<UserAccount> {
    if (!isValidUUID(id)) {
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

    let user: UserAccount | null;

    try {
      user = await this.userEntity.findOne({
        where: { id },
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get user from db",
        extensions: [
          {
            field: "",
            message: "Failed to get user from db",
          },
        ],
      });
    }

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
    return user;
  }

  async makeUserDeleted_typeorm(id: string): Promise<void> {
    try {
      await this.userEntity.softDelete({ id });
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to delete user from db",
        extensions: [
          {
            field: "",
            message: "Failed to delete user from db",
          },
        ],
      });
    }
  }

  async save_userRegistrationInfo_typeorm(
    registrationInfo: UserRegistration,
  ): Promise<void> {
    try {
      await this.userRegistrationEntity.save(registrationInfo);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to add registration confirmation code",
        extensions: [
          {
            field: "",
            message: "Failed to add registration confirmation code",
          },
        ],
      });
    }
  }

  async findRegistrationInfoByConfirmationCode_typeorm(
    confirmationCode: string,
  ): Promise<UserRegistration | null> {
    if (!isValidUUID(confirmationCode)) {
      return null;
    }

    try {
      return this.userRegistrationEntity.findOne({
        where: { confirmationCode },
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get row with registration confirmation code",
        extensions: [
          {
            field: "",
            message: "Failed to get row with registration confirmation code",
          },
        ],
      });
    }
  }

  async findRegistrationInfoByUserId_typeorm(
    userId: string,
  ): Promise<UserRegistration | null> {
    if (!isValidUUID(userId)) {
      return null;
    }

    try {
      return this.userRegistrationEntity.findOne({
        where: { userAccountId: userId },
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get row with registration confirmation code",
        extensions: [
          {
            field: "",
            message: "Failed to get row with registration confirmation code",
          },
        ],
      });
    }
  }

  async save_userPasswordRecoveryInfo_typeorm(
    passwordRecoveryInfo: UserPasswordRecovery,
  ): Promise<void> {
    try {
      await this.userPasswordRecoveryEntity.save(passwordRecoveryInfo);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to add password recovery code",
        extensions: [
          {
            field: "",
            message: "Failed to add password recovery code",
          },
        ],
      });
    }
  }

  async findPasswordRecoveryInfoByRecoveryCode_typeorm(
    recoveryCode: string,
  ): Promise<UserPasswordRecovery | null> {
    if (!isValidUUID(recoveryCode)) {
      return null;
    }

    try {
      return this.userPasswordRecoveryEntity.findOne({
        where: { recoveryCode },
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get row with password recovery code",
        extensions: [
          {
            field: "",
            message: "Failed to get row with password recovery code",
          },
        ],
      });
    }
  }

  async findByLoginOrEmail_typeorm(dto: {
    login: string;
    email: string;
  }): Promise<UserAccount | null> {
    try {
      return this.userEntity.findOne({
        where: [{ login: dto.login }, { email: dto.email }],
      });
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get user from db",
        extensions: [
          {
            field: "",
            message: "Failed to get user from db",
          },
        ],
      });
    }
  }
}
