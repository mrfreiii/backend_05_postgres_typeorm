import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { UserAccount } from "./user.entity.typeorm";

@Entity()
export class UserPasswordRecovery {
  @Column({ generated: "uuid" })
  recoveryCode: string;

  @Column({ type: "bigint" })
  codeExpirationDate: number;

  @OneToOne(
    () => UserAccount,
    (userAccount) => userAccount.userPasswordRecovery,
  )
  @JoinColumn()
  userAccount: UserAccount;
  @Column({ primary: true })
  userAccountId: string;
}
