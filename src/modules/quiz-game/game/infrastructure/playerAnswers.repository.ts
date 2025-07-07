import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { PlayerAnswers } from "../entity/playerAnswers.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class PlayerAnswersRepository {
  constructor(
    @InjectRepository(PlayerAnswers)
    private playerAnswersEntity: Repository<PlayerAnswers>,
  ) {}

  async save_player_answer_typeorm(playerAnswer: PlayerAnswers): Promise<void> {
    try {
      await this.playerAnswersEntity.save(playerAnswer);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save player answer in db",
        extensions: [
          {
            field: "",
            message: "Failed to save player answer in db",
          },
        ],
      });
    }
  }

  async getAnotherPlayerAnswers_typeorm(
    playerId: string,
  ): Promise<PlayerAnswers[]> {
    try {
      return this.playerAnswersEntity
        .createQueryBuilder("pa")
        .where("pa.playerId = :playerId", { playerId })
        .orderBy("pa.questionId", "DESC")
        .getMany();
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get another player answers count",
        extensions: [
          {
            field: "",
            message: "Failed to get another player answers count",
          },
        ],
      });
    }
  }
}
