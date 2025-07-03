import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { PlayerAnswers } from "../../entity/playerAnswers.entity.typeorm";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { PlayerAnswerViewDtoTypeorm } from "../../api/view-dto/playerAnswer.view-dto.pg.ts";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class PlayerAnswersQueryRepository {
  constructor(
    @InjectRepository(PlayerAnswers)
    private playerAnswersEntity: Repository<PlayerAnswers>,
  ) {}

  async getPlayerAnswerById_typeorm(
    playerAnswerId: string,
  ): Promise<PlayerAnswerViewDtoTypeorm> {
    let answer: PlayerAnswers | null;

    try {
      answer = await this.playerAnswersEntity
        .createQueryBuilder("pa")
        .where("pa.id = :playerAnswerId", { playerAnswerId })
        .getOne();
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get player answer from db",
        extensions: [
          {
            field: "",
            message: "Failed to get player answer from db",
          },
        ],
      });
    }

    if (!answer) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Player answer not found",
        extensions: [
          {
            field: "",
            message: "Player answer not found",
          },
        ],
      });
    }

    return PlayerAnswerViewDtoTypeorm.mapToView(answer);
  }
}
