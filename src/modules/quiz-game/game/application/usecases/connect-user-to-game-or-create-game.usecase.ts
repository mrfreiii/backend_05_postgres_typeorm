import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { Player } from "../../entity/player.entity.typeorm";
import { GamesRepository } from "../../infrastructure/games.repository";
import { PlayersRepository } from "../../infrastructure/players.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

export class ConnectUserToGameOrCreateGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectUserToGameOrCreateGameCommand)
export class ConnectUserToGameOrCreateGameCommandHandler
  implements ICommandHandler<ConnectUserToGameOrCreateGameCommand, string>
{
  constructor(
    private gamesRepository: GamesRepository,
    private playersRepository: PlayersRepository,
    @InjectRepository(Player) private playerEntity: Repository<Player>,
  ) {}

  async execute({
    userId,
  }: ConnectUserToGameOrCreateGameCommand): Promise<string> {
    // Checking if user already have a game
    const existentUserGame =
      await this.gamesRepository.getActiveGameIdByUserId(userId);
    if (existentUserGame) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "User already have a game",
        extensions: [
          {
            field: "",
            message: "User already have a game",
          },
        ],
      });
    }

    const newPlayer = this.playerEntity.create({
      userId,
    });
    await this.playersRepository.save_player_typeorm(newPlayer);

    return this.gamesRepository.connectToGameOrCreateNewGame(newPlayer.id);
  }
}
