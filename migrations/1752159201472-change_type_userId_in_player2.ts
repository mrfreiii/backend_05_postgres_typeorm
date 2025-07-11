import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTypeUserIdInPlayer21752159201472 implements MigrationInterface {
    name = 'ChangeTypeUserIdInPlayer21752159201472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_fddba4f9840cd131ebefd05bd5e"`);
        await queryRunner.query(`ALTER TABLE "player" ALTER COLUMN "userAccountId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_fddba4f9840cd131ebefd05bd5e" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_fddba4f9840cd131ebefd05bd5e"`);
        await queryRunner.query(`ALTER TABLE "player" ALTER COLUMN "userAccountId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_fddba4f9840cd131ebefd05bd5e" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD "userId" uuid NOT NULL`);
    }

}
