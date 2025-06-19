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
  //
  // update(dto: {
  //   session: SessionEntityType;
  //   newValues: UpdateSessionDomainDto;
  // }): SessionEntityType {
  //   const updateSession = { ...dto.session };
  //
  //   const deviceTitle = getDeviceTitle(dto.newValues.userAgent);
  //   const { issuedAt, expirationTime, version } = parseRefreshToken(
  //     dto.newValues.refreshToken,
  //   );
  //
  //   updateSession.ip = dto.newValues.ip || "unknown ip";
  //   updateSession.title = deviceTitle;
  //   updateSession.version = version;
  //   updateSession.issuedAt = issuedAt;
  //   updateSession.expirationTime = expirationTime;
  //
  //   return updateSession;
  // }
}
