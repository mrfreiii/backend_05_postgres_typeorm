import { CommandBus } from "@nestjs/cqrs";
import { ApiBearerAuth } from "@nestjs/swagger";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { SETTINGS } from "../../../../settings";
import { GameViewDtoTypeorm } from "./view-dto/game.view-dto.pg";
import { GamesRepository } from "../infrastructure/games.repository";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { JwtAuthGuard } from "../../../user-accounts/guards/bearer/jwt-auth.guard";
import { UserContextDto } from "../../../user-accounts/guards/dto/user-context.dto";
import { GamesQueryRepository } from "../infrastructure/query/games.query-repository";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";
import { ConnectUserToGameOrCreateGameCommand } from "../application/usecases/connect-user-to-game-or-create-game.usecase";
import { ExtractUserFromRequest } from "../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator";
import { AddPlayerAnswerCommand } from "../application/usecases/add-player-answer.usecase";
import { AddPlayerAnswerInputDto } from "./input-dto/add-player-answer.input-dto";
import { PlayerAnswerViewDtoTypeorm } from "./view-dto/playerAnswer.view-dto.pg.ts";
import { PlayerAnswersQueryRepository } from "../infrastructure/query/playerAnswers.query-repository";
import { validate as isValidUUID } from "uuid";

@Controller(SETTINGS.PATH.GAMES)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamesController {
  constructor(
    private commandBus: CommandBus,
    private gamesQueryRepository: GamesQueryRepository,
    private gamesRepository: GamesRepository,
    private playerAnswersQueryRepository: PlayerAnswersQueryRepository,
  ) {}

  @Post("connection")
  @HttpCode(HttpStatus.OK)
  async connectUserToGame(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDtoTypeorm> {
    const gameId = await this.commandBus.execute(
      new ConnectUserToGameOrCreateGameCommand(user.id),
    );

    return this.gamesQueryRepository.getByIdOrNotFoundFail_typeorm(gameId);
  }

  @Get(":id")
  async getGameById(
    @Param("id") id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDtoTypeorm> {
    let gameId = id;

    if (gameId === "my-current") {
      const res = await this.gamesRepository.getActiveGameIdByUserId(user?.id);
      if (
        !res
        // || res?.status === (GameStatusEnum.PendingSecondPlayer as string)
      ) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: "There is no active game for current user",
          extensions: [
            {
              field: "",
              message: "There is no active game for current user",
            },
          ],
        });
      }

      gameId = res?.id;
    } else {
      if (!isValidUUID(gameId)) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "Id has incorrect format",
          extensions: [
            {
              field: "id",
              message: "Id has incorrect format",
            },
          ],
        });
      }
    }

    const game =
      await this.gamesQueryRepository.getByIdOrNotFoundFail_typeorm(gameId);

    const players = [
      game?.firstPlayerProgress?.player?.id,
      game?.secondPlayerProgress?.player?.id,
    ];

    if (!players.includes(user.id)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "The game does not belong to the user",
        extensions: [
          {
            field: "",
            message: "The game does not belong to the user",
          },
        ],
      });
    }

    return game;
  }

  @Post("my-current/answers")
  @HttpCode(HttpStatus.OK)
  async addGameAnswer(
    @Body() body: AddPlayerAnswerInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PlayerAnswerViewDtoTypeorm> {
    const playerAnswerId = await this.commandBus.execute(
      new AddPlayerAnswerCommand({
        userId: user.id,
        playerAnswer: body.answer,
      }),
    );

    return this.playerAnswersQueryRepository.getPlayerAnswerById_typeorm(
      playerAnswerId,
    );
  }
}
