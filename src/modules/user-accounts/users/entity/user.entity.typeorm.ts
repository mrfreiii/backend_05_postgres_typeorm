import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  login: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  isEmailConfirmed: boolean;

  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn()
  deletedAt: string | null;
}
