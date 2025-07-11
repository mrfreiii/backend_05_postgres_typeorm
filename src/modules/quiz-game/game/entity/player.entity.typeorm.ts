import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { PlayerAnswers } from "./playerAnswers.entity.typeorm";
import { UserAccount } from "../../../user-accounts/users/entity/user.entity.typeorm";
import { PlayerGameResultStatusEnum } from "../enums/playerGameResultStatus.enum";

@Entity()
export class Player {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UserAccount)
  @JoinColumn()
  userAccount: UserAccount;
  @Column()
  userAccountId: string;

  @Column({ default: 0 })
  score: number;

  @OneToMany(() => PlayerAnswers, (answers) => answers.player)
  answers: PlayerAnswers[] | null;

  @Column({
    type: "enum",
    enum: PlayerGameResultStatusEnum,
    nullable: true,
  })
  status: PlayerGameResultStatusEnum;
}
