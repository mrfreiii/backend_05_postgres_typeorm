import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { SETTINGS } from "../../../../settings";
import { CommentsService } from "../application/comments.service";
import { CommentViewDtoTypeorm } from "./view-dto/comments.view-dto.pg";
import { UpdateCommentInputDto } from "./input-dto/update-comment.input-dto";
import { JwtAuthGuard } from "../../../user-accounts/guards/bearer/jwt-auth.guard";
import { UserContextDto } from "../../../user-accounts/guards/dto/user-context.dto";
import { UpdateLikeStatusInputDto } from "./input-dto/update-like-status.input-dto";
import { CommentsQueryRepository } from "../infrastructure/query/comments.query-repository";
import { JwtOptionalAuthGuard } from "../../../user-accounts/guards/bearer/jwt-optional-auth.guard";
import { ExtractUserFromRequest } from "../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator";
import { ExtractUserIfExistsFromRequest } from "../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator";

@Controller(SETTINGS.PATH.COMMENTS)
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @Get(":id")
  async getById(
    @Param("id") id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<CommentViewDtoTypeorm> {
    return this.commentsQueryRepository.getByIdOrNotFoundFail_typeorm({
      commentId: id,
      userId: user?.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentById(
    @Param("commentId") commentId: string,
    @Body() body: UpdateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    return this.commentsService.updateComment_typeorm({
      userId: user.id,
      commentId,
      dto: body,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCommentById(
    @Param("commentId") commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    return this.commentsService.deleteComment_typeorm({
      userId: user.id,
      commentId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(":commentId/like-status")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @Param("commentId") commentId: string,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    return this.commentsService.updateCommentLikeStatus_typeorm({
      userId: user.id,
      commentId,
      newLikeStatus: body.likeStatus,
    });
  }
}
