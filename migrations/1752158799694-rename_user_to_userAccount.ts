import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUserToUserAccount1752158799694
  implements MigrationInterface
{
  name = "RenameUserToUserAccount1752158799694";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_registration" DROP CONSTRAINT "FK_fe75e3b7be8a0c39cdebd6ad0ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" DROP CONSTRAINT "FK_d437bc74e7de5deab125c2ebc74"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "FK_7687919bf054bf262c669d3ae21"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_like" DROP CONSTRAINT "FK_b5a2fc7a9a2b6bcc8c74f6fbb8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" DROP CONSTRAINT "FK_909fc474ef645901d01f0cc0662"`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "isEmailConfirmed" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_9c4183ef80b974d1b11a5de05b1" UNIQUE ("login"), CONSTRAINT "UQ_56a0e4bcec2b5411beafa47ffa5" UNIQUE ("email"), CONSTRAINT "PK_6acfec7285fdf9f463462de3e9f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" ADD "userAccountId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" ADD CONSTRAINT "UQ_4ace49107ed95c50ac6a8b7ec67" UNIQUE ("userAccountId")`,
    );
    await queryRunner.query(`ALTER TABLE "session" ADD "userAccountId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" ADD "userAccountId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" ADD CONSTRAINT "UQ_d12cc823b6596f8f6233e3173ca" UNIQUE ("userAccountId")`,
    );
    await queryRunner.query(`ALTER TABLE "player" ADD "userAccountId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "comment_like" ADD "userAccountId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "comment" ADD "userAccountId" uuid`);
    await queryRunner.query(`ALTER TABLE "post_like" ADD "userAccountId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user_registration" DROP CONSTRAINT "PK_fe75e3b7be8a0c39cdebd6ad0ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" ADD CONSTRAINT "PK_fe75e3b7be8a0c39cdebd6ad0ac" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "session" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" DROP CONSTRAINT "PK_d437bc74e7de5deab125c2ebc74"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" ADD CONSTRAINT "PK_d437bc74e7de5deab125c2ebc74" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "player" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "comment_like" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "comment_like" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" DROP CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79"`,
    );
    await queryRunner.query(`ALTER TABLE "post_like" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "post_like" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" ADD CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79" UNIQUE ("postId", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" ADD CONSTRAINT "FK_4ace49107ed95c50ac6a8b7ec67" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_fd926899dc06a34b3440e68d8b5" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" ADD CONSTRAINT "FK_d12cc823b6596f8f6233e3173ca" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_fddba4f9840cd131ebefd05bd5e" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_like" ADD CONSTRAINT "FK_321b06bca88b94248b93f934910" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_4e56fb915c1c8af71469f0297e9" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" ADD CONSTRAINT "FK_b6e775c025285c3c3fff1efb41d" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_like" DROP CONSTRAINT "FK_b6e775c025285c3c3fff1efb41d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_4e56fb915c1c8af71469f0297e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_like" DROP CONSTRAINT "FK_321b06bca88b94248b93f934910"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "FK_fddba4f9840cd131ebefd05bd5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" DROP CONSTRAINT "FK_d12cc823b6596f8f6233e3173ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_fd926899dc06a34b3440e68d8b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" DROP CONSTRAINT "FK_4ace49107ed95c50ac6a8b7ec67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" DROP CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79"`,
    );
    await queryRunner.query(`ALTER TABLE "post_like" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "post_like" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" ADD CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79" UNIQUE ("postId", "userId")`,
    );
    await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "comment" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "comment_like" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "comment_like" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "player" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" DROP CONSTRAINT "PK_d437bc74e7de5deab125c2ebc74"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" ADD CONSTRAINT "PK_d437bc74e7de5deab125c2ebc74" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "session" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user_registration" DROP CONSTRAINT "PK_fe75e3b7be8a0c39cdebd6ad0ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" ADD CONSTRAINT "PK_fe75e3b7be8a0c39cdebd6ad0ac" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" DROP COLUMN "userAccountId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "userAccountId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_like" DROP COLUMN "userAccountId"`,
    );
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "userAccountId"`);
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" DROP CONSTRAINT "UQ_d12cc823b6596f8f6233e3173ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" DROP COLUMN "userAccountId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP COLUMN "userAccountId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" DROP CONSTRAINT "UQ_4ace49107ed95c50ac6a8b7ec67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" DROP COLUMN "userAccountId"`,
    );
    await queryRunner.query(`DROP TABLE "user_account"`);
    await queryRunner.query(
      `ALTER TABLE "post_like" ADD CONSTRAINT "FK_909fc474ef645901d01f0cc0662" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_like" ADD CONSTRAINT "FK_b5a2fc7a9a2b6bcc8c74f6fbb8b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_7687919bf054bf262c669d3ae21" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_password_recovery" ADD CONSTRAINT "FK_d437bc74e7de5deab125c2ebc74" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_registration" ADD CONSTRAINT "FK_fe75e3b7be8a0c39cdebd6ad0ac" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
