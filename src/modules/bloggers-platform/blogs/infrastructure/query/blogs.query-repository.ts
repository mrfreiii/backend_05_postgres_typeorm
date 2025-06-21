import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";

import { Blog } from "../../entity/blog.entity.typeorm";
import { BlogViewDtoPg } from "../../api/view-dto/blogs.view-dto.pg";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { GetBlogsQueryParams } from "../../api/input-dto/get-blogs-query-params.input-dto";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectRepository(Blog) private blogEntity: Repository<Blog>) {}

  async getByIdOrNotFoundFail_typeorm(blogId: string): Promise<BlogViewDtoPg> {
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
    return BlogViewDtoPg.mapToView(blog);
  }

  async getAll_typeorm(
    requestParams: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDtoPg[]>> {
    const query = this.blogEntity.createQueryBuilder();

    if (requestParams.searchNameTerm) {
      query.andWhere("name ilike :name", {
        name: `%${requestParams.searchNameTerm}%`,
      });
    }

    try {
      const totalCount = await query.getCount();
      const blogs = await query
        .orderBy(
          `"${requestParams.sortBy}"`,
          `${requestParams.convertSortDirection(requestParams.sortDirection)}`,
        )
        // .take(requestParams.pageSize)
        // .skip(requestParams.calculateSkip())
        .limit(requestParams.pageSize)
        .offset(requestParams.calculateSkip())
        .getMany();

      const items = blogs.map(BlogViewDtoPg.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: requestParams.pageNumber,
        size: requestParams.pageSize,
      });
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Failed to get all blogs",
        extensions: [
          {
            field: "",
            message: "Failed to get all blogs",
          },
        ],
      });
    }
  }
}
