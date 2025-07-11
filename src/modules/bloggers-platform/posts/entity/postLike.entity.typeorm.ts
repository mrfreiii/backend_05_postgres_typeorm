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
import { UserAccount } from "../../../user-accounts/users/entity/user.entity.typeorm";

@Entity()
@Unique(["postId", "userAccountId"])
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn()
  post: Post;
  @Column()
  postId: string;

  @ManyToOne(() => UserAccount) //односторонняя связь без второго колбека
  @JoinColumn()
  userAccount: UserAccount;
  @Column()
  userAccountId: string;

  @ManyToOne(() => LikeStatus)
  @JoinColumn()
  likeStatus: LikeStatus;
  @Column()
  likeStatusId: number;

  @UpdateDateColumn()
  updatedAt: string;
}
