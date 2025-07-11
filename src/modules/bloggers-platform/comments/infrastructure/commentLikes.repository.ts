import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { CommentLike } from "../entity/commentLike.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectRepository(CommentLike)
    private commentLikeEntity: Repository<CommentLike>,
  ) {}

  async findCommentLike_typeorm(dto: {
    commentId: string;
    userId: string;
  }): Promise<CommentLike | null> {
    const { commentId, userId } = dto;

    try {
      return this.commentLikeEntity.findOne({
        where: { commentId, userAccountId: userId },
      });
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get comment like from db",
        extensions: [
          {
            field: "",
            message: "Failed to get comment like from db",
          },
        ],
      });
    }
  }

  async save_comment_like_typeorm(commentLike: CommentLike): Promise<void> {
    try {
      await this.commentLikeEntity.save(commentLike);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save commentLike in db",
        extensions: [
          {
            field: "",
            message: "Failed to save commentLike in db",
          },
        ],
      });
    }
  }

  async deleteCommentLike_typeorm(id: number): Promise<void> {
    try {
      await this.commentLikeEntity.delete({ id });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to delete commentLike in db",
        extensions: [
          {
            field: "",
            message: "Failed to delete commentLike in db",
          },
        ],
      });
    }
  }
}
