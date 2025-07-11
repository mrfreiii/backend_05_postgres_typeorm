import { v4 as uuidv4 } from "uuid";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { parseRefreshToken } from "../../helpers";
import { getDeviceTitle } from "../../../sessions/helpers";
import { TokenGenerationService } from "../tokenGeneration.service";
import { Session } from "../../../sessions/entity/session.entity.typeorm";
import { LoginUserInputDto, LoginUserOutputDto } from "../dto/login-user.dto";
import { SessionsRepository } from "../../../sessions/infrastructure/sessions.repository";

export class LoginUserCommand {
  constructor(public dto: LoginUserInputDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserCommandHandler
  implements ICommandHandler<LoginUserCommand, LoginUserOutputDto>
{
  constructor(
    private sessionsRepository: SessionsRepository,
    private tokenGenerationService: TokenGenerationService,
    @InjectRepository(Session) private sessionEntity: Repository<Session>,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<LoginUserOutputDto> {
    const { userId, userAgent, ip } = dto;
    const deviceId = uuidv4();

    const accessToken = this.tokenGenerationService.createAccessToken(userId);
    const refreshToken = this.tokenGenerationService.createRefreshToken({
      userId,
      deviceId,
    });

    const deviceTitle = getDeviceTitle(userAgent);
    const { issuedAt, expirationTime, version } =
      parseRefreshToken(refreshToken);

    const session = this.sessionEntity.create({
      userAccountId: userId,
      deviceId,
      ip: ip || "unknown ip",
      title: deviceTitle,
      version,
      issuedAt,
      expirationTime,
    });

    await this.sessionsRepository.save_session_typeorm(session);

    return Promise.resolve({
      accessToken,
      refreshToken,
    });
  }
}
