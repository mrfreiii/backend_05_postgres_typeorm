import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

import { User } from "./user.entity.typeorm";

@Entity()
export class UserRegistration {
  @Column({ generated: "uuid" })
  confirmationCode: string;

  @Column({ type: "bigint" })
  codeExpirationDate: number;

  @OneToOne(() => User, (user) => user.userRegistration)
  @JoinColumn()
  user: User;

  @Column({ primary: true })
  userId: string;
}
