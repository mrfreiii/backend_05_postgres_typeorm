import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  LikeStatusEnum,
  mapEnumLikeStatusToBdStatus,
} from "../../enums/likes.enum";
import { CreatePostDto } from "../dto/post.dto";
import { Post } from "../entity/post.entity.typeorm";
import { PostLike } from "../entity/postLike.entity.typeorm";
import { PostsRepository } from "../infrastructure/posts.repository";
import { UpdatePostInputDto } from "../api/input-dto/update-post.input-dto";
import { PostLikesRepository } from "../infrastructure/postLikes.repository";
import { BlogsRepository } from "../../blogs/infrastructure/blogs.repository";

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private postLikesRepository: PostLikesRepository,
    private blogsRepository: BlogsRepository,
    @InjectRepository(Post) private postEntity: Repository<Post>,
    @InjectRepository(PostLike) private postLikeEntity: Repository<PostLike>,
  ) {}

  async createPost_typeorm(dto: CreatePostDto): Promise<string> {
    await this.blogsRepository.findByIdOrNotFoundFail_typeorm(dto.blogId);

    const post = this.postEntity.create({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
    });

    await this.postsRepository.save_post_typeorm(post);

    return post.id;
  }

  async updatePost_typeorm({
    id,
    dto,
  }: {
    id: string;
    dto: UpdatePostInputDto;
  }): Promise<void> {
    const { title, shortDescription, content, blogId } = dto;

    await this.blogsRepository.findByIdOrNotFoundFail_typeorm(dto.blogId);

    const post = await this.postsRepository.getByIdOrNotFoundFail_typeorm(id);

    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blogId = blogId;

    await this.postsRepository.save_post_typeorm(post);
  }

  async deletePost_typeorm(dto: { postId: string; blogId: string }) {
    await this.blogsRepository.findByIdOrNotFoundFail_typeorm(dto.blogId);

    const post = await this.postsRepository.getByIdOrNotFoundFail_typeorm(
      dto.postId,
    );

    await this.postsRepository.deletePost_typeorm(post.id);
  }

  async updatePostLikeStatus_typeorm(dto: {
    userId: string;
    postId: string;
    newLikeStatus: LikeStatusEnum;
  }): Promise<void> {
    const { userId, postId, newLikeStatus } = dto;

    await this.postsRepository.checkIfExist_typeorm(postId);

    const postLike = await this.postLikesRepository.findPostLike_typeorm({
      postId,
      userId,
    });

    if (!postLike?.id) {
      switch (newLikeStatus) {
        case LikeStatusEnum.None:
          break;
        case LikeStatusEnum.Like:
        case LikeStatusEnum.Dislike: {
          const postLike = this.postLikeEntity.create({
            postId,
            userAccountId: userId,
            likeStatusId: mapEnumLikeStatusToBdStatus(newLikeStatus),
          });

          await this.postLikesRepository.save_post_like_typeorm(postLike);
          break;
        }
      }
    } else {
      switch (newLikeStatus) {
        case LikeStatusEnum.None:
          await this.postLikesRepository.deletePostLike_typeorm(postLike.id);
          break;
        case LikeStatusEnum.Like:
        case LikeStatusEnum.Dislike:
          postLike.likeStatusId = mapEnumLikeStatusToBdStatus(newLikeStatus);

          await this.postLikesRepository.save_post_like_typeorm(postLike);
          break;
      }
    }
  }
}
