import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";

import { BlogViewDtoPg } from "./view-dto/blogs.view-dto.pg";
import { PostViewDtoTypeorm } from "../../posts/api/view-dto/posts.view-dto.pg";
import { PaginatedViewDto } from "../../../../core/dto/base.paginated.view-dto";
import { GetBlogsQueryParams } from "./input-dto/get-blogs-query-params.input-dto";
import { UserContextDto } from "../../../user-accounts/guards/dto/user-context.dto";
import { GetPostsQueryParams } from "../../posts/api/input-dto/get-posts-query-params.input-dto";

import { BlogsService } from "../application/blogs.service";
import { PostsService } from "../../posts/application/posts.service";

import { BlogsQueryRepository } from "../infrastructure/query/blogs.query-repository";
import { PostsQueryRepository } from "../../posts/infrastructure/query/posts.query-repository";

import { SETTINGS } from "../../../../settings";
import { JwtOptionalAuthGuard } from "../../../user-accounts/guards/bearer/jwt-optional-auth.guard";
import { ExtractUserIfExistsFromRequest } from "../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator";

@Controller(SETTINGS.PATH.BLOGS_PUBLIC)
export class BlogsPublicController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDtoPg[]>> {
    return this.blogsQueryRepository.getAll_typeorm(query);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(":id/posts")
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param("id") id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDtoTypeorm[]>> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail_typeorm(id);

    return this.postsQueryRepository.getAll_typeorm({
      requestParams: query,
      blogId: id,
      userId: user?.id,
    });
  }

  @Get(":id")
  async getBlogById(@Param("id") id: string): Promise<BlogViewDtoPg> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail_typeorm(id);
  }
}
