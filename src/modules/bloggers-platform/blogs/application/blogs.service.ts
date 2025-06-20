import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { CreateBlogDto } from "../dto/blog.dto";
import { Blog } from "../entity/blog.entity.typeorm";
import { BlogsRepository } from "../infrastructure/blogs.repository";
import { UpdateBlogInputDto } from "../api/input-dto/update-blog.input-dto";

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    @InjectRepository(Blog) private blogEntity: Repository<Blog>,
  ) {}

  async createBlog_typeorm(dto: CreateBlogDto): Promise<string> {
    const { name, description, websiteUrl } = dto;

    const blog = this.blogEntity.create({
      name,
      description,
      websiteUrl,
      isMembership: false,
    });

    await this.blogsRepository.save_blog_typeorm(blog);

    return blog.id;
  }

  async updateBlog_typeorm({
    id,
    dto,
  }: {
    id: string;
    dto: UpdateBlogInputDto;
  }): Promise<void> {
    const { name, description, websiteUrl } = dto;

    const blog = await this.blogsRepository.findByIdOrNotFoundFail_typeorm(id);

    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;

    await this.blogsRepository.save_blog_typeorm(blog);
  }

  async deleteBlog(id: string) {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail_typeorm(id);

    await this.blogsRepository.deleteBlog_typeorm(blog.id);
  }
}
