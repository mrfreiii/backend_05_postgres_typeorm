import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";

import {
  PostQueryRepoType,
  PostViewDtoTypeorm,
} from "../../api/view-dto/posts.view-dto.pg";
import { Post } from "../../entity/post.entity.typeorm";
import { LikeStatusEnum } from "../../../enums/likes.enum";
import { PostLike } from "../../entity/postLike.entity.typeorm";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { GetPostsQueryParams } from "../../api/input-dto/get-posts-query-params.input-dto";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post) private postEntity: Repository<PostQueryRepoType>,
  ) {}

  async checkIfExist_typeorm(postId: string): Promise<void> {
    if (!isValidUUID(postId)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Post not found",
        extensions: [
          {
            field: "",
            message: "Post not found",
          },
        ],
      });
    }

    let post: Post | null;

    try {
      post = await this.postEntity.findOne({
        where: { id: postId },
        select: { title: true },
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get post from db",
        extensions: [
          {
            field: "",
            message: "Failed to get post from db",
          },
        ],
      });
    }

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Post not found",
        extensions: [
          {
            field: "",
            message: "Post not found",
          },
        ],
      });
    }
  }

  async getByIdOrNotFoundFail_typeorm(dto: {
    postId: string;
    userId?: string;
  }): Promise<PostViewDtoTypeorm> {
    const { postId, userId } = dto;

    if (!isValidUUID(postId)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Post not found",
        extensions: [
          {
            field: "",
            message: "Post not found",
          },
        ],
      });
    }

    let post: PostQueryRepoType | null | undefined;

    try {
      post = await this._getPostQueryBuilder(userId)!
        .where("p.id = :postId", { postId })
        .getRawOne();
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get post from db",
        extensions: [
          {
            field: "",
            message: "Failed to get post from db",
          },
        ],
      });
    }

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Post not found",
        extensions: [
          {
            field: "",
            message: "Post not found",
          },
        ],
      });
    }

    return PostViewDtoTypeorm.mapToView(post);
  }

  async getAll_typeorm({
    requestParams,
    blogId,
    userId,
  }: {
    requestParams: GetPostsQueryParams;
    blogId?: string;
    userId?: string;
  }): Promise<PaginatedViewDto<PostViewDtoTypeorm[]>> {
    const query = this._getPostQueryBuilder(userId);
    if (!query) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to create query builder",
        extensions: [
          {
            field: "",
            message: "Failed to create query builder",
          },
        ],
      });
    }

    if (blogId) {
      query.andWhere("p.blogId = :blogId", { blogId });
    }

    try {
      const totalCount = await query.getCount();
      const posts = await query
        .orderBy(
          `"${requestParams.sortBy}"`,
          `${requestParams.convertSortDirection(requestParams.sortDirection)}`,
        )
        .limit(requestParams.pageSize)
        .offset(requestParams.calculateSkip())
        .getRawMany();

      const items = posts.map((p) => PostViewDtoTypeorm.mapToView(p));

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
        message: "Failed to get posts from db",
        extensions: [
          {
            field: "",
            message: "Failed to get posts from db",
          },
        ],
      });
    }
  }

  private _getPostQueryBuilder(
    userId?: string,
  ): SelectQueryBuilder<PostQueryRepoType> | undefined {
    try {
      return this.postEntity
        .createQueryBuilder("p")
        .leftJoin("p.blog", "b")
        .select([
          'p.id as "id"',
          'p.title as "title"',
          'p.shortDescription as "shortDescription"',
          'p.content as "content"',
          'p.blogId as "blogId"',
          'p.createdAt as "createdAt"',
          'b.name as "blogName"',
        ])
        .addSelect(
          (sb) =>
            sb
              .select("COUNT(*)")
              .from("PostLike", "pl")
              .leftJoin("pl.likeStatus", "ls")
              .where("pl.postId = p.id and ls.status = :likeStatus", {
                likeStatus: LikeStatusEnum.Like,
              }),
          "likesCount",
        )
        .addSelect(
          (sb) =>
            sb
              .select("COUNT(*)")
              .from("PostLike", "pl")
              .leftJoin("pl.likeStatus", "ls")
              .where("pl.postId = p.id and ls.status = :dislikeStatus", {
                dislikeStatus: LikeStatusEnum.Dislike,
              }),
          "dislikesCount",
        )
        .addSelect(
          (sb) =>
            sb
              .select("ls.status")
              .from(PostLike, "pl")
              .leftJoin("pl.likeStatus", "ls")
              .where("pl.postId = p.id and pl.userAccountId = :userAccountId", {
                userAccountId: userId,
              }),
          "myStatus",
        )
        .addSelect(
          (sb) =>
            sb
              .select(
                `jsonb_agg(
                            json_build_object(
                                'addedAt', aggregated_pl."addedAt", 
                                'userId', aggregated_pl."userId", 
                                'login', aggregated_pl."login"
                            )
                         )`,
              )
              .from(
                (sb) =>
                  sb
                    .select([
                      'pl.updatedAt as "addedAt"',
                      'pl.userAccountId as "userId"',
                      'u.login as "login"',
                    ])
                    .from(PostLike, "pl")
                    .leftJoin("pl.likeStatus", "ls")
                    .leftJoin("pl.userAccount", "u")
                    .where("pl.postId = p.id and ls.status = :status", {
                      status: LikeStatusEnum.Like,
                    })
                    .orderBy('pl."updatedAt"', "DESC")
                    .limit(3),
                "aggregated_pl",
              ),
          "newestLikes",
        );
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to create query builder",
        extensions: [
          {
            field: "",
            message: "Failed to create query builder",
          },
        ],
      });
    }
  }
}
