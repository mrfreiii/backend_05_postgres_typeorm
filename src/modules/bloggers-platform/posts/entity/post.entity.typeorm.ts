import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Blog } from "../../blogs/entity/blog.entity.typeorm";

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  @JoinColumn()
  blog: Blog;

  @Column()
  blogId: string;

  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn()
  deletedAt: string | null;
  //
  // createInstance(dto: CreatePostDomainDto): PostEntityType {
  //   const post = new PostEntity();
  //
  //   post.id = uuidv4();
  //   post.title = dto.title;
  //   post.shortDescription = dto.shortDescription;
  //   post.content = dto.content;
  //   post.blogId = dto.blogId;
  //   post.createdAt = new Date(Date.now()).toISOString();
  //
  //   return post;
  // }
  //
  // update(dto: {
  //   post: PostEntityType;
  //   newValues: UpdatePostInputDto;
  // }): PostEntityType {
  //   const updatedPost = { ...dto.post };
  //
  //   updatedPost.title = dto.newValues.title;
  //   updatedPost.shortDescription = dto.newValues.shortDescription;
  //   updatedPost.content = dto.newValues.content;
  //   updatedPost.blogId = dto.newValues.blogId;
  //
  //   return updatedPost;
  // }
}
