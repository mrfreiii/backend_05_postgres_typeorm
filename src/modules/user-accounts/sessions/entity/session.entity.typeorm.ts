import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { UserAccount } from "../../users/entity/user.entity.typeorm";

@Entity()
export class Session {
  @ManyToOne(() => UserAccount, (userAccount) => userAccount.sessions)
  @JoinColumn()
  userAccount: UserAccount;
  @Column()
  userAccountId: string;

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
