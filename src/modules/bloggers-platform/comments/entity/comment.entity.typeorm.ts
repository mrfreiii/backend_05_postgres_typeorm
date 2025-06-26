import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

import { CommentLike } from "./commentLike.entity.typeorm";
import { Post } from "../../posts/entity/post.entity.typeorm";
import { User } from "../../../user-accounts/users/entity/user.entity.typeorm";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn()
  post: Post;
  @Column()
  postId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn()
  deletedAt: string | null;

  @OneToMany(() => CommentLike, (likes) => likes.comment)
  likes: CommentLike[];
}
