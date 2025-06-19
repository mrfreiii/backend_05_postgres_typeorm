import { add } from "date-fns";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { UsersRepository } from "../../infrastructure/users.repository";
import { EmailService } from "../../../../notifications/application/email.service";
import { UserPasswordRecovery } from "../../entity/passwordRecovery.entity.typeorm";

export class SendUserPasswordRecoveryCodeCommand {
  constructor(
    public inputData: {
      email: string;
      currentURL: string;
    },
  ) {}
}

@CommandHandler(SendUserPasswordRecoveryCodeCommand)
export class SendUserPasswordRecoveryCodeCommandHandler
  implements ICommandHandler<SendUserPasswordRecoveryCodeCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    @InjectRepository(UserPasswordRecovery)
    private userPasswordRecoveryEntity: Repository<UserPasswordRecovery>,
  ) {}

  async execute({
    inputData,
  }: SendUserPasswordRecoveryCodeCommand): Promise<void> {
    const { email, currentURL } = inputData;

    const user = await this.usersRepository.findByEmail_typeorm(email);
    if (!user) {
      return;
    }

    const recoveryInfo = this.userPasswordRecoveryEntity.create({
      codeExpirationDate: add(new Date(), {
        minutes: 2,
      }).getTime(),
      userId: user.id,
    });

    await this.usersRepository.save_userPasswordRecoveryInfo_typeorm(
      recoveryInfo,
    );

    this.emailService
      .sendEmailWithPasswordRecoveryCode({
        email: user.email,
        recoveryCode: recoveryInfo.recoveryCode,
        currentURL,
      })
      .catch(console.error);
  }
}
