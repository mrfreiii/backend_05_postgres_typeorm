import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";

import { Question } from "../entity/question.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question) private questionEntity: Repository<Question>,
  ) {}

  async save_question_typeorm(question: Question) {
    try {
      const response = await this.questionEntity.save(question);

      return response?.id;
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save question in db",
        extensions: [
          {
            field: "",
            message: "Failed to save question in db",
          },
        ],
      });
    }
  }

  async findOrNotFoundFail_typeorm(id: string): Promise<Question> {
    if (!isValidUUID(id)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Question not found",
        extensions: [
          {
            field: "",
            message: "Question not found",
          },
        ],
      });
    }

    let question: Question | null;

    try {
      question = await this.questionEntity.findOne({
        where: { id },
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get question from db",
        extensions: [
          {
            field: "",
            message: "Failed to question user from db",
          },
        ],
      });
    }

    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Question not found",
        extensions: [
          {
            field: "",
            message: "Question not found",
          },
        ],
      });
    }
    return question;
  }

  async deletedQuestion_typeorm(id: string): Promise<void> {
    try {
      await this.questionEntity.softDelete({ id });
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to delete question from db",
        extensions: [
          {
            field: "",
            message: "Failed to delete question from db",
          },
        ],
      });
    }
  }
}
