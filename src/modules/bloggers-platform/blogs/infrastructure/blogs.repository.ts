import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";

import { Blog } from "../entity/blog.entity.typeorm";
import { DomainException } from "../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class BlogsRepository {
  constructor(@InjectRepository(Blog) private blogEntity: Repository<Blog>) {}

  async save_blog_typeorm(blog: Blog): Promise<void> {
    try {
      await this.blogEntity.save(blog);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to save blog in db",
        extensions: [
          {
            field: "",
            message: "Failed to save blog in db",
          },
        ],
      });
    }
  }

  async findByIdOrNotFoundFail_typeorm(blogId: string): Promise<Blog> {
    if (!isValidUUID(blogId)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Blog not found",
        extensions: [
          {
            field: "",
            message: "Blog not found",
          },
        ],
      });
    }

    let blog: Blog | null;

    try {
      blog = await this.blogEntity
        .createQueryBuilder("b")
        .where("b.id = :blogId", { blogId })
        .getOne();
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to get blog from db",
        extensions: [
          {
            field: "",
            message: "Failed to get blog from db",
          },
        ],
      });
    }

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Blog not found",
        extensions: [
          {
            field: "",
            message: "Blog not found",
          },
        ],
      });
    }
    return blog;
  }

  async deleteBlog_typeorm(blogId: string): Promise<void> {
    try {
      await this.blogEntity.softDelete({ id: blogId });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "Failed to delete blog",
        extensions: [
          {
            field: "",
            message: "Failed to delete blog",
          },
        ],
      });
    }
  }
}
