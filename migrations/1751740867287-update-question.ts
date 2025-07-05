import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQuestion1751740867287 implements MigrationInterface {
  name = "UpdateQuestion1751740867287";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question" DROP COLUMN "correctAnswers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question" ADD "correctAnswers" text array NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question" DROP COLUMN "correctAnswers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question" ADD "correctAnswers" text NOT NULL`,
    );
  }
}
