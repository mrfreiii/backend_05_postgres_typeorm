import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostLikes41750877407661 implements MigrationInterface {
  name = "AddPostLikes41750877407661";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_like" ADD CONSTRAINT "FK_de2f7146c5eaf3cbb05d80709aa" FOREIGN KEY ("likeStatusId") REFERENCES "like_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_like" DROP CONSTRAINT "FK_de2f7146c5eaf3cbb05d80709aa"`,
    );
  }
}
