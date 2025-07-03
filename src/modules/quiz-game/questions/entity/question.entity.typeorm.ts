import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column("simple-array")
  correctAnswers: string[];

  @Column()
  published: boolean;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @DeleteDateColumn()
  deletedAt: string;
}
