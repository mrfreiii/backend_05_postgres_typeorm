import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQuestions1751729411536 implements MigrationInterface {
  name = "UpdateQuestions1751729411536";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "question" ADD "updatedAt" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "question" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
