import { add } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { UsersRepository } from "../../infrastructure/users.repository";
import { UserRegistration } from "../../entity/registation.entity.typeorm";
import { EmailService } from "../../../../notifications/application/email.service";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

export class ResendUserRegistrationEmailCommand {
  constructor(
    public inputData: {
      email: string;
      currentURL: string;
    },
  ) {}
}

@CommandHandler(ResendUserRegistrationEmailCommand)
export class ResendUserRegistrationEmailCommandHandler
  implements ICommandHandler<ResendUserRegistrationEmailCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    @InjectRepository(UserRegistration)
    private userRegistrationEntity: Repository<UserRegistration>,
  ) {}

  async execute({
    inputData,
  }: ResendUserRegistrationEmailCommand): Promise<void> {
    const { email, currentURL } = inputData;

    const user = await this.usersRepository.findByEmail_typeorm(email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User not found",
        extensions: [
          {
            field: "email",
            message: "User not found",
          },
        ],
      });
    }

    if (user.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Email already confirmed",
        extensions: [
          {
            field: "email",
            message: "Email already confirmed",
          },
        ],
      });
    }

    let registrationInfo =
      await this.usersRepository.findRegistrationInfoByUserId_typeorm(user.id);

    if (!registrationInfo) {
      registrationInfo = this.userRegistrationEntity.create({
        userId: user.id,
      });
    }

    registrationInfo.confirmationCode = uuidv4();
    registrationInfo.codeExpirationDate = add(new Date(), {
      minutes: 2,
    }).getTime();

    await this.usersRepository.save_userRegistrationInfo_typeorm(
      registrationInfo,
    );

    this.emailService
      .sendEmailWithConfirmationCode({
        email: user.email,
        confirmationCode: registrationInfo.confirmationCode,
        currentURL,
      })
      .catch(console.error);
  }
}
