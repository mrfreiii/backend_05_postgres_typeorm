import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { LikeStatus } from "./likes/entity/likes.entity.typeorm";
import { UserAccountsModule } from "../user-accounts/user-accounts.module";

import { Blog } from "./blogs/entity/blog.entity.typeorm";
import { BlogsService } from "./blogs/application/blogs.service";
import { BlogsAdminController } from "./blogs/api/blogs-admin.controller";
import { BlogsRepository } from "./blogs/infrastructure/blogs.repository";
import { BlogsPublicController } from "./blogs/api/blogs-public.controller";
import { BlogsQueryRepository } from "./blogs/infrastructure/query/blogs.query-repository";

import { Post } from "./posts/entity/post.entity.typeorm";
import { PostsController } from "./posts/api/posts.controller";
import { PostsService } from "./posts/application/posts.service";
import { PostLike } from "./posts/entity/postLike.entity.typeorm";
import { PostsRepository } from "./posts/infrastructure/posts.repository";
import { PostLikesRepository } from "./posts/infrastructure/postLikes.repository";
import { PostsQueryRepository } from "./posts/infrastructure/query/posts.query-repository";

import { CommentLikesRepository } from "./comments/infrastructure/commentLikes.repository";
import { Comment } from "./comments/entity/comment.entity.typeorm";
import { CommentsController } from "./comments/api/comments.controller";
import { CommentsService } from "./comments/application/comments.service";
import { CommentLike } from "./comments/entity/commentLike.entity.typeorm";
import { CommentsRepository } from "./comments/infrastructure/comments.repository";
import { CommentsQueryRepository } from "./comments/infrastructure/query/comments.query-repository";

const controllers = [
  BlogsAdminController,
  BlogsPublicController,
  PostsController,
  CommentsController,
];

const services = [BlogsService, PostsService, CommentsService];

const repos = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  PostLikesRepository,
  PostsQueryRepository,
  CommentsRepository,
  CommentLikesRepository,
  CommentsQueryRepository,
];

const typeorm_entities = [
  Blog,
  Post,
  PostLike,
  Comment,
  CommentLike,
  LikeStatus,
];

@Module({
  imports: [
    UserAccountsModule,
    TypeOrmModule.forFeature([...typeorm_entities]),
  ],
  controllers: [...controllers],
  providers: [...services, ...repos],
  exports: [TypeOrmModule.forFeature([...typeorm_entities])],
})
export class BloggersPlatformModule {}
