import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LikeStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;
}
