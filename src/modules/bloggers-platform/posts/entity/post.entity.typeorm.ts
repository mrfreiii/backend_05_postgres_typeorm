import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { PostLike } from "./postLike.entity.typeorm";
import { Blog } from "../../blogs/entity/blog.entity.typeorm";
import { Comment } from "../../comments/entity/comment.entity.typeorm";

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

  @OneToMany(() => PostLike, (likes) => likes.post)
  likes: PostLike[];

  @OneToMany(() => Comment, (comments) => comments.post)
  comments: Comment;
}
