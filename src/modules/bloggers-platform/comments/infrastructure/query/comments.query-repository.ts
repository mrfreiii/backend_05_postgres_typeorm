import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

import {
  CommentQueryRepoType,
  CommentViewDtoTypeorm,
} from "../../api/view-dto/comments.view-dto.pg";
import { LikeStatusEnum } from "../../../enums/likes.enum";
import { Comment } from "../../entity/comment.entity.typeorm";
import { CommentLike } from "../../entity/commentLike.entity.typeorm";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { GetCommentsQueryParams } from "../../api/input-dto/get-comments-query-params.input-dto";

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment)
    private commentEntity: Repository<CommentQueryRepoType>,
  ) {}

  async getByIdOrNotFoundFail_typeorm(dto: {
    commentId: string;
    userId?: string;
  }): Promise<CommentViewDtoTypeorm> {
    const { commentId, userId } = dto;

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

    let comment: CommentQueryRepoType | null | undefined;

    try {
      comment = await this._getCommentQueryBuilder(userId)
        .where("c.id = :commentId", { commentId })
        .getRawOne();
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

    return CommentViewDtoTypeorm.mapToView(comment);
  }

  async getAll_typeorm({
    requestParams,
    postId,
    userId,
  }: {
    requestParams: GetCommentsQueryParams;
    postId?: string;
    userId?: string;
  }): Promise<PaginatedViewDto<CommentViewDtoTypeorm[]>> {
    const query = this._getCommentQueryBuilder(userId);
    // const queryParams: string[] = [];
    //
    // let dataQuery = `
    //    SELECT c.*, u."login" as "userLogin"
    //    FROM ${SETTINGS.TABLES.COMMENTS} c
    //      LEFT JOIN ${SETTINGS.TABLES.USERS} u
    //      ON c."userId" = u."id"
    //        WHERE c."deletedAt" IS NULL
    // `;
    //
    // let countQuery = `
    //    SELECT count(*)
    //    FROM ${SETTINGS.TABLES.COMMENTS} c
    //      WHERE c."deletedAt" IS NULL
    // `;

    if (postId) {
      query.andWhere("c.postId = :postId", { postId });
      // const additionalPart = ` AND c."postId" = $1`;
      //
      // dataQuery = `${dataQuery} ${additionalPart}`;
      // countQuery = `${countQuery} ${additionalPart}`;
      //
      // queryParams.push(postId);
    }

    // dataQuery = `
    //    ${dataQuery}
    //      ORDER BY "${requestParams.sortBy}" ${requestParams.sortDirection}
    //      LIMIT ${requestParams.pageSize}
    //      OFFSET ${requestParams.calculateSkip()}
    // `;

    try {
      const totalCount = await query.getCount();
      const comments = await query
        .orderBy(
          `"${requestParams.sortBy}"`,
          `${requestParams.convertSortDirection(requestParams.sortDirection)}`,
        )
        .limit(requestParams.pageSize)
        .offset(requestParams.calculateSkip())
        .getRawMany();
      // const comments = await this.dataSource.query(dataQuery, [...queryParams]);

      // const totalCountRes = await this.dataSource.query(countQuery, [
      //   ...queryParams,
      // ]);

      const items = comments.map((c) => CommentViewDtoTypeorm.mapToView(c));

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: requestParams.pageNumber,
        size: requestParams.pageSize,
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get comments from db",
        extensions: [
          {
            field: "",
            message: "Failed to get comments from db",
          },
        ],
      });
    }
  }

  private _getCommentQueryBuilder(
    userId?: string,
  ): SelectQueryBuilder<CommentQueryRepoType> {
    return this.commentEntity
      .createQueryBuilder("c")
      .leftJoin("c.user", "u")
      .select([
        'c.id as "id"',
        'c.content as "content"',
        'c.userId as "userId"',
        'c.createdAt as "createdAt"',
        'u.login as "userLogin"',
      ])
      .addSelect(
        (sb) =>
          sb
            .select("COUNT(*)")
            .from(CommentLike, "cl")
            .leftJoin("cl.likeStatus", "ls")
            .where("cl.commentId = c.id and ls.status = :likeStatus", {
              likeStatus: LikeStatusEnum.Like,
            }),
        "likesCount",
      )
      .addSelect(
        (sb) =>
          sb
            .select("COUNT(*)")
            .from(CommentLike, "cl")
            .leftJoin("cl.likeStatus", "ls")
            .where("cl.commentId = c.id and ls.status = :dislikeStatus", {
              dislikeStatus: LikeStatusEnum.Dislike,
            }),
        "dislikesCount",
      )
      .addSelect(
        (sb) =>
          sb
            .select("ls.status")
            .from(CommentLike, "cl")
            .leftJoin("cl.likeStatus", "ls")
            .where("cl.commentId = c.id and cl.userId = :userId", {
              userId,
            }),
        "myStatus",
      );
  }
}
