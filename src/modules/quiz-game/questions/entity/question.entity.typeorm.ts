import {
  Column,
  Entity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

export const questionConstraints = {
  minLength: 10,
  maxLength: 500,
};

@Entity()
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  body: string;

  @Column("text", { array: true })
  correctAnswers: string[];

  @Column()
  published: boolean;

  @CreateDateColumn()
  createdAt: string;

  @Column({ default: null })
  updatedAt: string;

  @DeleteDateColumn()
  deletedAt: string;
}
