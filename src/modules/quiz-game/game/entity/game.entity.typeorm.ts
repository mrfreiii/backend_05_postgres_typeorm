import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Player } from "./player.entity.typeorm";
import { GameQuestion } from "./gameQuestions.entity.typeorm";

export const GAME_QUESTIONS_COUNT = 5;

@Entity()
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => Player)
  @JoinColumn()
  firstPlayer: Player;
  @Column()
  firstPlayerId: string;

  @OneToOne(() => Player)
  @JoinColumn()
  secondPlayer: Player;
  @Column({ nullable: true })
  secondPlayerId: string;

  @OneToMany(() => GameQuestion, (gameQuestions) => gameQuestions.game)
  gameQuestions: GameQuestion[];

  @Column()
  status: string;

  @CreateDateColumn()
  pairCreatedDate: string;

  @Column({ nullable: true })
  startGameDate: string;

  @Column({ nullable: true })
  finishGameDate: string;
}
