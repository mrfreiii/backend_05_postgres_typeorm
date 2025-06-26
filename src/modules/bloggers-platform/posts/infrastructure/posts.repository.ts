import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";

import { Post } from "../entity/post.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class PostsRepository {
  constructor(@InjectRepository(Post) private postEntity: Repository<Post>) {}

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

  async save_post_typeorm(post: Post): Promise<void> {
    try {
      await this.postEntity.save(post);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save post in db",
        extensions: [
          {
            field: "",
            message: "Failed to save post in db",
          },
        ],
      });
    }
  }

  async getByIdOrNotFoundFail_typeorm(postId: string): Promise<Post> {
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
    return post;
  }

  async deletePost_typeorm(postId: string): Promise<void> {
    try {
      await this.postEntity.softDelete({ id: postId });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to delete post",
        extensions: [
          {
            field: "",
            message: "Failed to delete post",
          },
        ],
      });
    }
  }
}
