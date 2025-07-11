import { add } from "date-fns";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { CreateUserCommand } from "./create-user.usecase";
import { UsersRepository } from "../../infrastructure/users.repository";
import { UserRegistration } from "../../entity/registation.entity.typeorm";
import { EmailService } from "../../../../notifications/application/email.service";
import { RegisterUserInputDto } from "../../../auth/api/input-dto/register-user.input-dto";

export class RegisterUserCommand {
  constructor(
    public inputData: {
      dto: RegisterUserInputDto;
      currentURL: string;
    },
  ) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler
  implements ICommandHandler<RegisterUserCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private commandBus: CommandBus,
    private emailService: EmailService,
    @InjectRepository(UserRegistration)
    private userRegistrationEntity: Repository<UserRegistration>,
  ) {}

  async execute({ inputData }: RegisterUserCommand): Promise<void> {
    const { dto, currentURL } = inputData;
    const createdUserId = await this.commandBus.execute(
      new CreateUserCommand(dto),
    );

    const user =
      await this.usersRepository.findOrNotFoundFail_typeorm(createdUserId);

    const registrationInfo = this.userRegistrationEntity.create({
      codeExpirationDate: add(new Date(), {
        minutes: 2,
      }).getTime(),
      userAccountId: user.id,
    });

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
