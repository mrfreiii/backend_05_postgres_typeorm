import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { SETTINGS } from "../../../../settings";
import { PostsService } from "../application/posts.service";
import { PostsQueryRepository } from "../infrastructure/query/posts.query-repository";
import { CreateCommentByPostIdInputDto } from "./input-dto/posts.input-dto";
import { PaginatedViewDto } from "../../../../core/dto/base.paginated.view-dto";
import { GetPostsQueryParams } from "./input-dto/get-posts-query-params.input-dto";
import { CommentsService } from "../../comments/application/comments.service";
import { CommentsQueryRepository } from "../../comments/infrastructure/query/comments.query-repository";
import { GetCommentsQueryParams } from "../../comments/api/input-dto/get-comments-query-params.input-dto";
import { JwtAuthGuard } from "../../../user-accounts/guards/bearer/jwt-auth.guard";
import { ExtractUserFromRequest } from "../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator";
import { UserContextDto } from "../../../user-accounts/guards/dto/user-context.dto";
import { UpdateLikeStatusInputDto } from "../../comments/api/input-dto/update-like-status.input-dto";
import { JwtOptionalAuthGuard } from "../../../user-accounts/guards/bearer/jwt-optional-auth.guard";
import { ExtractUserIfExistsFromRequest } from "../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator";
import { PostViewDtoTypeorm } from "./view-dto/posts.view-dto.pg";
import { CommentViewDtoTypeorm } from "../../comments/api/view-dto/comments.view-dto.pg";

@Controller(SETTINGS.PATH.POSTS)
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private postsService: PostsService,
    private commentsService: CommentsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDtoTypeorm[]>> {
    return this.postsQueryRepository.getAll_typeorm({
      requestParams: query,
      userId: user?.id,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @Get(":postId")
  async getPostById(
    @Param("postId") postId: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PostViewDtoTypeorm> {
    return this.postsQueryRepository.getByIdOrNotFoundFail_typeorm({
      postId,
      userId: user?.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(":postId/like-status")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostLikeStatus(
    @Param("postId") postId: string,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.postsService.updatePostLikeStatus_typeorm({
      userId: user.id,
      postId,
      newLikeStatus: body.likeStatus,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(":id/comments")
  async createCommentByPostId(
    @Param("id") id: string,
    @Body() body: CreateCommentByPostIdInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDtoTypeorm> {
    await this.postsQueryRepository.checkIfExist_typeorm(id);

    const commentId = await this.commentsService.createComment_typeorm({
      content: body.content,
      postId: id,
      userId: user?.id,
    });

    return this.commentsQueryRepository.getByIdOrNotFoundFail_typeorm({
      commentId,
      userId: user?.id,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @Get(":id/comments")
  async getCommentsByPostId(
    @Query() query: GetCommentsQueryParams,
    @Param("id") id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<CommentViewDtoTypeorm[]>> {
    await this.postsQueryRepository.checkIfExist_typeorm(id);

    return this.commentsQueryRepository.getAll_typeorm({
      requestParams: query,
      postId: id,
      userId: user?.id,
    });
  }
}
