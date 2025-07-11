import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTypeUserIdInPlayer1752159091198
  implements MigrationInterface
{
  name = "ChangeTypeUserIdInPlayer1752159091198";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "player" ADD "userId" uuid NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "player" ADD "userId" character varying NOT NULL`,
    );
  }
}
