import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGameFix1751468820374 implements MigrationInterface {
  name = "AddGameFix1751468820374";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "secondPlayerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61" FOREIGN KEY ("secondPlayerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "secondPlayerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61" FOREIGN KEY ("secondPlayerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
