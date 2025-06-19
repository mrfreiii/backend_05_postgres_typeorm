import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { CryptoService } from "../crypto.service";
import { User } from "../../entity/user.entity.typeorm";
import { CreateUserDto } from "../../dto/create-user.dto";
import { UsersRepository } from "../../infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    @InjectRepository(User) private userEntity: Repository<User>,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const userWithTheSameLogin = await this.usersRepository.findByLogin_typeorm(
      dto.login,
    );
    if (userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with the same login already exists",
        extensions: [
          {
            field: "login",
            message: "User with the same login already exists",
          },
        ],
      });
    }

    const userWithTheSameEmail = await this.usersRepository.findByEmail_typeorm(
      dto.email,
    );
    if (userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "User with the same email already exists",
        extensions: [
          {
            field: "email",
            message: "User with the same email already exists",
          },
        ],
      });
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const newUser = this.userEntity.create({
      email: dto.email,
      login: dto.login,
      passwordHash,
      isEmailConfirmed: false,
    });

    return this.usersRepository.save_user_typeorm(newUser);
  }
}
