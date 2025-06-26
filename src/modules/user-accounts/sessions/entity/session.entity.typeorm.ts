import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { User } from "../../users/entity/user.entity.typeorm";

@Entity()
export class Session {
  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ primary: true })
  deviceId: string;

  @Column()
  ip: string;

  @Column()
  title: string;

  @Column({ type: "bigint" })
  version: number;

  @Column()
  issuedAt: string;

  @Column()
  expirationTime: string;
}
