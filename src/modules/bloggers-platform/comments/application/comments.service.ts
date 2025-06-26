import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  LikeStatusEnum,
  mapEnumLikeStatusToBdStatus,
} from "../../enums/likes.enum";
import { CreateCommentDto } from "../dto/comment.dto";
import { Comment } from "../entity/comment.entity.typeorm";
import { CommentLike } from "../entity/commentLike.entity.typeorm";
import { CommentsRepository } from "../infrastructure/comments.repository";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { UpdateCommentInputDto } from "../api/input-dto/update-comment.input-dto";
import { CommentLikesRepository } from "../infrastructure/commentLikes.repository";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";
import { UsersExternalQueryRepository } from "../../../user-accounts/users/infrastructure/external-query/users.external-query-repository";

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private commentLikesRepository: CommentLikesRepository,
    private usersExternalQueryRepository: UsersExternalQueryRepository,
    @InjectRepository(Comment) private commentEntity: Repository<Comment>,
    @InjectRepository(CommentLike) private commentLikeEntity: Repository<CommentLike>,
  ) {}

  async createComment_typeorm(dto: CreateCommentDto): Promise<string> {
    await this.usersExternalQueryRepository.getByIdOrNotFoundFail_typeorm(
      dto.userId,
    );

    const comment = this.commentEntity.create({
      content: dto.content,
      postId: dto.postId,
      userId: dto.userId,
    });

    await this.commentsRepository.save_comment_typeorm(comment);

    return comment.id;
  }

  async updateComment_typeorm({
    userId,
    commentId,
    dto,
  }: {
    userId: string;
    commentId: string;
    dto: UpdateCommentInputDto;
  }): Promise<void> {
    const comment =
      await this.commentsRepository.getByIdOrNotFoundFail_typeorm(commentId);

    if (comment.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "Forbidden to edit another user's comment",
        extensions: [
          {
            field: "",
            message: "Forbidden to edit another user's comment",
          },
        ],
      });
    }

    comment.content = dto.content;
    await this.commentsRepository.save_comment_typeorm(comment);
  }

  async deleteComment_typeorm({
    userId,
    commentId,
  }: {
    userId: string;
    commentId: string;
  }): Promise<void> {
    const comment =
      await this.commentsRepository.getByIdOrNotFoundFail_typeorm(commentId);

    if (comment.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "Forbidden to delete another user's comment",
        extensions: [
          {
            field: "",
            message: "Forbidden to delete another user's comment",
          },
        ],
      });
    }

    await this.commentsRepository.deleteComment_typeorm(commentId);
  }

  async updateCommentLikeStatus_typeorm(dto: {
    userId: string;
    commentId: string;
    newLikeStatus: LikeStatusEnum;
  }): Promise<void> {
    const { userId, commentId, newLikeStatus } = dto;

    await this.commentsRepository.getByIdOrNotFoundFail_typeorm(commentId);

    const commentLike = await this.commentLikesRepository.findCommentLike_typeorm({
      commentId,
      userId,
    });

    if (!commentLike?.id) {
      switch (newLikeStatus) {
        case LikeStatusEnum.None:
          break;
        case LikeStatusEnum.Like:
        case LikeStatusEnum.Dislike:
          const commentLike = this.commentLikeEntity.create({
            commentId,
            userId,
            likeStatusId: mapEnumLikeStatusToBdStatus(newLikeStatus),
          })

          await this.commentLikesRepository.save_comment_like_typeorm(commentLike);
          break;
      }
    } else {
      switch (newLikeStatus) {
        case LikeStatusEnum.None:
          await this.commentLikesRepository.deleteCommentLike_typeorm(commentLike.id);
          break;
        case LikeStatusEnum.Like:
        case LikeStatusEnum.Dislike:
          commentLike.likeStatusId = mapEnumLikeStatusToBdStatus(newLikeStatus);

          await this.commentLikesRepository.save_comment_like_typeorm(commentLike)
          break;
      }
    }
  }
}
