import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUserIdToUserAccountId1752161163719 implements MigrationInterface {
    name = 'ChangeUserIdToUserAccountId1752161163719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" DROP CONSTRAINT "PK_d437bc74e7de5deab125c2ebc74"`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user_registration" DROP CONSTRAINT "PK_fe75e3b7be8a0c39cdebd6ad0ac"`);
        await queryRunner.query(`ALTER TABLE "user_registration" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "comment_like" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_fd926899dc06a34b3440e68d8b5"`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "userAccountId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" DROP CONSTRAINT "FK_d12cc823b6596f8f6233e3173ca"`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" ALTER COLUMN "userAccountId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" ADD CONSTRAINT "PK_d12cc823b6596f8f6233e3173ca" PRIMARY KEY ("userAccountId")`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" DROP CONSTRAINT "UQ_d12cc823b6596f8f6233e3173ca"`);
        await queryRunner.query(`ALTER TABLE "user_registration" DROP CONSTRAINT "FK_4ace49107ed95c50ac6a8b7ec67"`);
        await queryRunner.query(`ALTER TABLE "user_registration" ALTER COLUMN "userAccountId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_registration" ADD CONSTRAINT "PK_4ace49107ed95c50ac6a8b7ec67" PRIMARY KEY ("userAccountId")`);
        await queryRunner.query(`ALTER TABLE "user_registration" DROP CONSTRAINT "UQ_4ace49107ed95c50ac6a8b7ec67"`);
        await queryRunner.query(`ALTER TABLE "comment_like" DROP CONSTRAINT "FK_321b06bca88b94248b93f934910"`);
        await queryRunner.query(`ALTER TABLE "comment_like" ALTER COLUMN "userAccountId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_4e56fb915c1c8af71469f0297e9"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "userAccountId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79" UNIQUE ("postId", "userId")`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_fd926899dc06a34b3440e68d8b5" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" ADD CONSTRAINT "FK_d12cc823b6596f8f6233e3173ca" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_registration" ADD CONSTRAINT "FK_4ace49107ed95c50ac6a8b7ec67" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_like" ADD CONSTRAINT "FK_321b06bca88b94248b93f934910" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_4e56fb915c1c8af71469f0297e9" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_4e56fb915c1c8af71469f0297e9"`);
        await queryRunner.query(`ALTER TABLE "comment_like" DROP CONSTRAINT "FK_321b06bca88b94248b93f934910"`);
        await queryRunner.query(`ALTER TABLE "user_registration" DROP CONSTRAINT "FK_4ace49107ed95c50ac6a8b7ec67"`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" DROP CONSTRAINT "FK_d12cc823b6596f8f6233e3173ca"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_fd926899dc06a34b3440e68d8b5"`);
        await queryRunner.query(`ALTER TABLE "post_like" DROP CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "userAccountId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_4e56fb915c1c8af71469f0297e9" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_like" ALTER COLUMN "userAccountId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_like" ADD CONSTRAINT "FK_321b06bca88b94248b93f934910" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_registration" ADD CONSTRAINT "UQ_4ace49107ed95c50ac6a8b7ec67" UNIQUE ("userAccountId")`);
        await queryRunner.query(`ALTER TABLE "user_registration" DROP CONSTRAINT "PK_4ace49107ed95c50ac6a8b7ec67"`);
        await queryRunner.query(`ALTER TABLE "user_registration" ALTER COLUMN "userAccountId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_registration" ADD CONSTRAINT "FK_4ace49107ed95c50ac6a8b7ec67" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" ADD CONSTRAINT "UQ_d12cc823b6596f8f6233e3173ca" UNIQUE ("userAccountId")`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" DROP CONSTRAINT "PK_d12cc823b6596f8f6233e3173ca"`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" ALTER COLUMN "userAccountId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" ADD CONSTRAINT "FK_d12cc823b6596f8f6233e3173ca" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "userAccountId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_fd926899dc06a34b3440e68d8b5" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_like" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_like" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_registration" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_registration" ADD CONSTRAINT "PK_fe75e3b7be8a0c39cdebd6ad0ac" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_password_recovery" ADD CONSTRAINT "PK_d437bc74e7de5deab125c2ebc74" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "session" ADD "userId" character varying NOT NULL`);
    }

}
