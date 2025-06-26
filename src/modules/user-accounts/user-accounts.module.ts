import { UsersConfig } from "./users/config/users.config";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule, JwtService } from "@nestjs/jwt";

import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from "./constants/auth-tokens.inject-constants";
import { NotificationsModule } from "../notifications/notifications.module";

import { User } from "./users/entity/user.entity.typeorm";
import { UserRegistration } from "./users/entity/registation.entity.typeorm";

import { AuthController } from "./auth/api/auth.controller";
import { UsersController } from "./users/api/users.controller";
import { SessionsController } from "./sessions/api/sessions.controller";

import { CryptoService } from "./users/application/crypto.service";
import { UsersExternalService } from "./users/application/users.external-service";
import { TokenGenerationService } from "./auth/application/tokenGeneration.service";

import { UsersRepository } from "./users/infrastructure/users.repository";
import { SessionsRepository } from "./sessions/infrastructure/sessions.repository";
import { AuthQueryRepository } from "./auth/infrastructure/query/auth.query-repository";
import { UsersQueryRepository } from "./users/infrastructure/query/users.query-repository";
import { SessionsQueryRepository } from "./sessions/infrastructure/query/sessions.query-repository";
import { UsersExternalQueryRepository } from "./users/infrastructure/external-query/users.external-query-repository";

import { JwtStrategy } from "./guards/bearer/jwt.strategy";
import { LocalStrategy } from "./guards/local/local.strategy";

import { LoginUserCommandHandler } from "./auth/application/usecases/login-user.usecase";
import { CreateUserCommandHandler } from "./users/application/usecases/create-user.usecase";
import { LogoutUserCommandHandler } from "./auth/application/usecases/logout-user.usecase";
import { DeleteUserCommandHandler } from "./users/application/usecases/delete-user.usecase";
import { ValidateUserCommandHandler } from "./auth/application/usecases/validate-user.usecase";
import { RegisterUserCommandHandler } from "./users/application/usecases/register-user.usecase";
import { RefreshTokenCommandHandler } from "./auth/application/usecases/refresh-token.usecase";
import { UpdateUserPasswordCommandHandler } from "./users/application/usecases/update-user-password.usecase";
import { DeleteSessionByIdCommandHandler } from "./sessions/application/usecases/delete-session-by-id.usecase";
import { ConfirmUserRegistrationCommandHandler } from "./users/application/usecases/confirm-user-registration.usecase";
import { DeleteAllOtherSessionCommandHandler } from "./sessions/application/usecases/delete-all-other-sessions.usecase";
import { ResendUserRegistrationEmailCommandHandler } from "./users/application/usecases/resend-user-registration-email.usecase";
import { SendUserPasswordRecoveryCodeCommandHandler } from "./users/application/usecases/send-user-password-recovery-code.usecase";
import { UserPasswordRecovery } from "./users/entity/passwordRecovery.entity.typeorm";
import { Session } from "./sessions/entity/session.entity.typeorm";

const commandHandlers = [
  ValidateUserCommandHandler,
  LoginUserCommandHandler,
  CreateUserCommandHandler,
  DeleteUserCommandHandler,
  LogoutUserCommandHandler,
  RegisterUserCommandHandler,
  RefreshTokenCommandHandler,
  DeleteSessionByIdCommandHandler,
  UpdateUserPasswordCommandHandler,
  DeleteAllOtherSessionCommandHandler,
  ConfirmUserRegistrationCommandHandler,
  ResendUserRegistrationEmailCommandHandler,
  SendUserPasswordRecoveryCodeCommandHandler,
];

const services = [
  CryptoService,
  TokenGenerationService,
  UsersExternalService,
  {
    provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
    useFactory: (usersConfig: UsersConfig): JwtService => {
      return new JwtService({
        secret: usersConfig.accessTokenSecret,
        signOptions: { expiresIn: usersConfig.accessTokenExpiresIn },
      });
    },
    inject: [UsersConfig],
  },
  {
    provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
    useFactory: (usersConfig: UsersConfig): JwtService => {
      return new JwtService({
        secret: usersConfig.refreshTokenSecret,
        signOptions: { expiresIn: usersConfig.refreshTokenExpiresIn },
      });
    },
    inject: [UsersConfig],
  },
];

const repos = [
  UsersRepository,
  UsersQueryRepository,
  AuthQueryRepository,
  UsersExternalQueryRepository,
  SessionsRepository,
  SessionsQueryRepository,
];

const strategies = [LocalStrategy, JwtStrategy];

const typeorm_entities = [
  User,
  UserRegistration,
  UserPasswordRecovery,
  Session,
];

@Module({
  imports: [
    NotificationsModule,
    JwtModule,
    TypeOrmModule.forFeature([...typeorm_entities]),
  ],
  controllers: [UsersController, AuthController, SessionsController],
  providers: [...commandHandlers, ...services, ...repos, ...strategies],
  exports: [
    UsersExternalQueryRepository,
    UsersExternalService,
    TypeOrmModule.forFeature([...typeorm_entities]),
  ],
})
export class UserAccountsModule {}
