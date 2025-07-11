import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUserIdToUserAccountId21752161280684 implements MigrationInterface {
    name = 'ChangeUserIdToUserAccountId21752161280684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_like" DROP CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79"`);
        await queryRunner.query(`ALTER TABLE "post_like" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD CONSTRAINT "UQ_a4c3c528a1cb80dad8706a1fa9c" UNIQUE ("postId", "userAccountId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_like" DROP CONSTRAINT "UQ_a4c3c528a1cb80dad8706a1fa9c"`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79" UNIQUE ("postId", "userId")`);
    }

}
