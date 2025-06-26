import {
  Column,
  Entity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { Post } from "../../posts/entity/post.entity.typeorm";

@Entity()
export class Blog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  isMembership: boolean;

  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn()
  deletedAt: string | null;

  @OneToMany(() => Post, (posts) => posts.blog)
  posts: Post[];
}
