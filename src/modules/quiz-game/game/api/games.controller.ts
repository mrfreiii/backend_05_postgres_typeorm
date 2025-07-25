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
  Query,
  UseGuards,
} from "@nestjs/common";
import { validate as isValidUUID } from "uuid";

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
import { GetGamesQueryParams } from "./input-dto/get-games-query-params.input-dto";
import { PaginatedViewDto } from "../../../../core/dto/base.paginated.view-dto";
import { GamesStatisticViewDtoTypeorm } from "./view-dto/games-statistic.view-dto.pg";
import { PlayersQueryRepository } from "../infrastructure/query/players.query-repository";
import { AllGamesStatisticViewDtoTypeorm } from "./view-dto/games-all-user-statistic.view-dto.pg";
import { GetAllGamesStatisticQueryParamsInputDto } from "./input-dto/get-all-games-statistic-query-params.input-dto";

@Controller(SETTINGS.PATH.GAMES)
export class GamesController {
  constructor(
    private commandBus: CommandBus,
    private gamesQueryRepository: GamesQueryRepository,
    private gamesRepository: GamesRepository,
    private playerAnswersQueryRepository: PlayerAnswersQueryRepository,
    private playersQueryRepository: PlayersQueryRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("pairs/connection")
  @HttpCode(HttpStatus.OK)
  async connectUserToGame(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDtoTypeorm> {
    const gameId = await this.commandBus.execute(
      new ConnectUserToGameOrCreateGameCommand(user.id),
    );

    return this.gamesQueryRepository.getByIdOrNotFoundFail_typeorm(gameId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("pairs/:id")
  async getGameById(
    @Param("id") id: string,
    @Query() query: GetGamesQueryParams,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDtoTypeorm | PaginatedViewDto<GameViewDtoTypeorm[]>> {
    let gameId = id;

    if (gameId === "my-current") {
      const res = await this.gamesRepository.getActiveGameIdByUserId(user?.id);
      if (!res) {
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
    } else if (gameId === "my") {
      return this.gamesQueryRepository.getAll_typeorm({
        requestParams: query,
        userId: user.id,
      });
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("pairs/my-current/answers")
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("users/my-statistic")
  @HttpCode(HttpStatus.OK)
  async getUserGamesStatistic(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GamesStatisticViewDtoTypeorm> {
    return this.playersQueryRepository.getStatistic_typeorm(user.id);
  }

  @Get("users/top")
  @HttpCode(HttpStatus.OK)
  async getStatisticForAllUsers(
    @Query() query: GetAllGamesStatisticQueryParamsInputDto,
  ): Promise<PaginatedViewDto<AllGamesStatisticViewDtoTypeorm>> {
    return this.playersQueryRepository.getAllGamesStatistic_typeorm(query);
  }
}
