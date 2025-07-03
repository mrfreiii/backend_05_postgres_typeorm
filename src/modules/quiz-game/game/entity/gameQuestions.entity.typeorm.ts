import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

import { Game } from "./game.entity.typeorm";
import { Question } from "../../questions/entity/question.entity.typeorm";

@Entity()
@Unique(["gameId", "questionId"])
export class GameQuestion {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Game, (game) => game.gameQuestions)
  @JoinColumn()
  game: Game;
  @Column()
  gameId: string;

  @ManyToOne(() => Question)
  @JoinColumn()
  question: Question;
  @Column()
  questionId: string;
}
