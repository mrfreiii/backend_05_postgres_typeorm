import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Comment } from "./comment.entity.typeorm";
import { LikeStatus } from "../../likes/entity/likes.entity.typeorm";
import { User } from "../../../user-accounts/users/entity/user.entity.typeorm";

@Entity()
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Comment, (comment) => comment.likes)
  @JoinColumn()
  comment: Comment;
  @Column()
  commentId: string;

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
