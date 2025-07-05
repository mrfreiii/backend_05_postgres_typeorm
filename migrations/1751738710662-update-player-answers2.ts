import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePlayerAnswers21751738710662 implements MigrationInterface {
    name = 'UpdatePlayerAnswers21751738710662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_answers" DROP COLUMN "addedAt"`);
        await queryRunner.query(`ALTER TABLE "player_answers" ADD "addedAt" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_answers" DROP COLUMN "addedAt"`);
        await queryRunner.query(`ALTER TABLE "player_answers" ADD "addedAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

}
