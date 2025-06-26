import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostLikes1750862522797 implements MigrationInterface {
  name = "AddPostLikes1750862522797";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "like_status" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_9114863939b12d42d305ae8e1d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "like_status" ("id","status")
            VALUES (1, 'Like'),(2, 'Dislike')`,
    );

    await queryRunner.query(
      `CREATE TABLE "post_like" ("id" SERIAL NOT NULL, "postId" uuid NOT NULL, "userId" uuid NOT NULL, "likeStatusId" integer NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79" UNIQUE ("postId", "userId"), CONSTRAINT "PK_0e95caa8a8b56d7797569cf5dc6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" ADD CONSTRAINT "FK_789b3f929eb3d8760419f87c8a9" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" ADD CONSTRAINT "FK_909fc474ef645901d01f0cc0662" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_like" DROP CONSTRAINT "FK_909fc474ef645901d01f0cc0662"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_like" DROP CONSTRAINT "FK_789b3f929eb3d8760419f87c8a9"`,
    );
    await queryRunner.query(`DROP TABLE "post_like"`);
    await queryRunner.query(`DROP TABLE "like_status"`);
  }
}
