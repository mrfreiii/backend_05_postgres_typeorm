import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity.typeorm";

@Entity()
export class UserPasswordRecovery {
  @Column({ generated: "uuid" })
  recoveryCode: string;

  @Column({ type: "bigint" })
  codeExpirationDate: number;

  @OneToOne(() => User, (user) => user.userPasswordRecovery)
  @JoinColumn()
  user: User;

  @Column({ primary: true })
  userId: string;
}
