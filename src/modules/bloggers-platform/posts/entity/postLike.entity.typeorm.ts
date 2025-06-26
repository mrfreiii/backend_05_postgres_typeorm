import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

import { Post } from "./post.entity.typeorm";
import { LikeStatus } from "../../likes/entity/likes.entity.typeorm";
import { User } from "../../../user-accounts/users/entity/user.entity.typeorm";

@Entity()
@Unique(["postId", "userId"])
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn()
  post: Post;

  @Column()
  postId: string;

  @ManyToOne(() => User) //односторонняя связь без второго колбека
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => LikeStatus)
  @JoinColumn()
  likeStatus: LikeStatus;

  @Column()
  likeStatusId: number;

  @UpdateDateColumn()
  updatedAt: string;
}
