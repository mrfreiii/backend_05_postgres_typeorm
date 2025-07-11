import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGameStatusResultToPlayer1752241391363
  implements MigrationInterface
{
  name = "AddGameStatusResultToPlayer1752241391363";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."player_status_enum" AS ENUM('win', 'lose', 'draw')`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD "status" "public"."player_status_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."player_status_enum"`);
  }
}
