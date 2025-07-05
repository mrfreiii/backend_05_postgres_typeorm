import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePlayerAnswers1751738304065 implements MigrationInterface {
    name = 'UpdatePlayerAnswers1751738304065'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_answers" DROP COLUMN "addedAt"`);
        await queryRunner.query(`ALTER TABLE "player_answers" ADD "addedAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_answers" DROP COLUMN "addedAt"`);
        await queryRunner.query(`ALTER TABLE "player_answers" ADD "addedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
