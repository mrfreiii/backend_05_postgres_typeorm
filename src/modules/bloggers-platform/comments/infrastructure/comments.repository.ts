import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";

import { Comment } from "../entity/comment.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private commentEntity: Repository<Comment>,
  ) {}

  async save_comment_typeorm(comment: Comment): Promise<void> {
    try {
      await this.commentEntity.save(comment);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save comment in db",
        extensions: [
          {
            field: "",
            message: "Failed to save comment in db",
          },
        ],
      });
    }
  }

  async getByIdOrNotFoundFail_typeorm(commentId: string): Promise<Comment> {
    if (!isValidUUID(commentId)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Comment not found",
        extensions: [
          {
            field: "",
            message: "Comment not found",
          },
        ],
      });
    }

    let comment: Comment | null;

    try {
      comment = await this.commentEntity.findOne({
        where: { id: commentId },
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get comment from db",
        extensions: [
          {
            field: "",
            message: "Failed to get comment from db",
          },
        ],
      });
    }

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Comment not found",
        extensions: [
          {
            field: "",
            message: "Comment not found",
          },
        ],
      });
    }

    return comment;
  }

  async deleteComment_typeorm(commentId: string): Promise<void> {
    try {
      await this.commentEntity.softDelete({ id: commentId });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to delete comment",
        extensions: [
          {
            field: "",
            message: "Failed to delete comment",
          },
        ],
      });
    }
  }
}
