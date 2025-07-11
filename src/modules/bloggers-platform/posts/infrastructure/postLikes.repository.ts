import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { PostLike } from "../entity/postLike.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectRepository(PostLike) private postLikeEntity: Repository<PostLike>,
  ) {}

  async findPostLike_typeorm(dto: {
    postId: string;
    userId: string;
  }): Promise<PostLike | null> {
    const { postId, userId } = dto;

    try {
      return this.postLikeEntity.findOne({
        where: { postId, userAccountId: userId },
      });
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get post like from db",
        extensions: [
          {
            field: "",
            message: "Failed to get post like from db",
          },
        ],
      });
    }
  }

  async save_post_like_typeorm(postLike: PostLike): Promise<void> {
    try {
      await this.postLikeEntity.save(postLike);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save postLike in db",
        extensions: [
          {
            field: "",
            message: "Failed to save postLike in db",
          },
        ],
      });
    }
  }

  async deletePostLike_typeorm(id: number): Promise<void> {
    try {
      await this.postLikeEntity.delete({ id });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to delete postLike in db",
        extensions: [
          {
            field: "",
            message: "Failed to delete postLike in db",
          },
        ],
      });
    }
  }
}
