import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { UserRegistration } from "./registation.entity.typeorm";
import { Session } from "../../sessions/entity/session.entity.typeorm";
import { UserPasswordRecovery } from "./passwordRecovery.entity.typeorm";

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

  @OneToOne(() => UserRegistration, (userRegistration) => userRegistration.user)
  userRegistration: UserRegistration;

  @OneToOne(
    () => UserPasswordRecovery,
    (userPasswordRecovery) => userPasswordRecovery.user,
  )
  userPasswordRecovery: UserPasswordRecovery;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}
