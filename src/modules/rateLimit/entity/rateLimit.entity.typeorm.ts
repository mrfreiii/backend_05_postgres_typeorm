import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RateLimit {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  url: string;

  @Column()
  ip: string;

  @Column({ type: "bigint" })
  date: number;
}
