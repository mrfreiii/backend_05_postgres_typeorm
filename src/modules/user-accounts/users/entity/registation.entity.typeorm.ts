import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

import { UserAccount } from "./user.entity.typeorm";

@Entity()
export class UserRegistration {
  @Column({ generated: "uuid" })
  confirmationCode: string;

  @Column({ type: "bigint" })
  codeExpirationDate: number;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.userRegistration)
  @JoinColumn()
  userAccount: UserAccount;
  @Column({ primary: true })
  userAccountId: string;
}
