import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

import { SETTINGS } from "../../../../../settings";
import { PostEntityType } from "../../domain/post.entity.pg";
import {
  PostQueryRepoType,
  PostViewDtoPg,
  PostViewDtoPgInputType,
} from "../../api/view-dto/posts.view-dto.pg";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { GetPostsQueryParams } from "../../api/input-dto/get-posts-query-params.input-dto";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { Post } from "../../entity/post.entity.typeorm";

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private postEntity: Repository<PostQueryRepoType>,
  ) {}

  // async getByIdOrNotFoundFail_typeorm(postId: string): Promise<PostViewDtoPg> {
  //   if (!isValidUUID(postId)) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: "Post not found",
  //       extensions: [
  //         {
  //           field: "",
  //           message: "Post not found",
  //         },
  //       ],
  //     });
  //   }
  //
  //   let post: Post | null;
  //
  //   try {
  //     post = await this.postEntity
  //         .createQueryBuilder("p")
  //         .where("p.id = :postId", { postId })
  //         .getOne();
  //   } catch (e) {
  //     console.log(e);
  //     throw new DomainException({
  //       code: DomainExceptionCode.InternalServerError,
  //       message: "Failed to get post from db",
  //       extensions: [
  //         {
  //           field: "",
  //           message: "Failed to get post from db",
  //         },
  //       ],
  //     });
  //   }
  //
  //   if (!post) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: "Post not found",
  //       extensions: [
  //         {
  //           field: "",
  //           message: "Post not found",
  //         },
  //       ],
  //     });
  //   }
  //   return PostViewDtoPg.mapToView({ post });
  // }

  async getByIdOrNotFoundFail_typeorm(postId: string): Promise<PostViewDtoPg> {
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
      post = await this.postEntity
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.blog", "b")
        .select([
          'p.id as "id"',
          'p.title as "title"',
          'p.shortDescription as "shortDescription"',
          'p.content as "content"',
          'p.blogId as "blogId"',
          'p.createdAt as "createdAt"',
          'b.name as "blogName"',
        ])
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
    return PostViewDtoPg.mapToView({ post });
  }

  async getAll_typeorm({
    requestParams,
    blogId,
  }: {
    requestParams: GetPostsQueryParams;
    blogId?: string;
  }): Promise<PaginatedViewDto<PostViewDtoPg[]>> {
    const query = this.postEntity
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.blog", "b")
      .select([
        'p.id as "id"',
        'p.title as "title"',
        'p.shortDescription as "shortDescription"',
        'p.content as "content"',
        'p.blogId as "blogId"',
        'p.createdAt as "createdAt"',
        'b.name as "blogName"',
      ]);

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
        // .take(requestParams.pageSize)
        // .skip(requestParams.calculateSkip())
        .limit(requestParams.pageSize)
        .offset(requestParams.calculateSkip())
        .getRawMany();

      const items = posts.map((p) => PostViewDtoPg.mapToView({ post: p }));

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
}
