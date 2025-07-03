import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { PlayerAnswers } from "./playerAnswers.entity.typeorm";
import { User } from "../../../user-accounts/users/entity/user.entity.typeorm";

@Entity()
export class Player {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
  @Column()
  userId: string;

  @Column({ default: 0 })
  score: number;

  @OneToMany(() => PlayerAnswers, (answers) => answers.player)
  answers: PlayerAnswers[] | null;
}
