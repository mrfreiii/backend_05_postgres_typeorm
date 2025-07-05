import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

import { Player } from "./player.entity.typeorm";
import { Question } from "../../questions/entity/question.entity.typeorm";

@Entity()
@Unique(["playerId", "questionId"])
export class PlayerAnswers {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Player)
  @JoinColumn()
  player: Player;
  @Column()
  playerId: string;

  @ManyToOne(() => Question)
  @JoinColumn()
  question: Question;
  @Column()
  questionId: string;

  @Column()
  status: string; // Correct, Incorrect

  @Column()
  addedAt: string;
}
