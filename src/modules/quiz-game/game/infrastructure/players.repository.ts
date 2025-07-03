import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Player } from "../entity/player.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player) private playerEntity: Repository<Player>,
  ) {}

  async save_player_typeorm(player: Player): Promise<void> {
    try {
      await this.playerEntity.save(player);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save player in db",
        extensions: [
          {
            field: "",
            message: "Failed to save player in db",
          },
        ],
      });
    }
  }

  async getPlayerById_typeorm(playerId: string): Promise<Player | null> {
    try {
      return this.playerEntity.findOne({
        where: {
          id: playerId,
        },
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save player in db",
        extensions: [
          {
            field: "",
            message: "Failed to save player in db",
          },
        ],
      });
    }
  }
}
