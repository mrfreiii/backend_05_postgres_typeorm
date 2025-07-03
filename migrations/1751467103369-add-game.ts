import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGame1751467103369 implements MigrationInterface {
  name = "AddGame1751467103369";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "player" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "score" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "player_answers" ("id" SERIAL NOT NULL, "playerId" uuid NOT NULL, "questionId" uuid NOT NULL, "status" character varying NOT NULL, "addedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_15c21825b978c0c54e7603ecf98" UNIQUE ("playerId", "questionId"), CONSTRAINT "PK_ae9d18a286e5b5e0c4bfcb057c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstPlayerId" uuid NOT NULL, "secondPlayerId" uuid NOT NULL, "status" character varying NOT NULL, "pairCreatedDate" TIMESTAMP NOT NULL DEFAULT now(), "startGameDate" character varying, "finishGameDate" character varying, CONSTRAINT "REL_e2e6d984f70f61e5435c3be619" UNIQUE ("firstPlayerId"), CONSTRAINT "REL_ee762a5104680b6af6cf7b94f6" UNIQUE ("secondPlayerId"), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game_question" ("id" SERIAL NOT NULL, "gameId" uuid NOT NULL, "questionId" uuid NOT NULL, CONSTRAINT "UQ_379d1e5aefdf901d5f7bff3fecd" UNIQUE ("gameId", "questionId"), CONSTRAINT "PK_08867ba249fa9d179d5449d27d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "question" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_7687919bf054bf262c669d3ae21" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_answers" ADD CONSTRAINT "FK_dee6f59898d0eba8096910456cd" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_answers" ADD CONSTRAINT "FK_99e896a1f456d0c543c5c83a3da" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d" FOREIGN KEY ("firstPlayerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61" FOREIGN KEY ("secondPlayerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "FK_d35bdfc9ff116d456dcad4a580e" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "FK_0040e663701d18ed9d1c49ecf6b" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "FK_0040e663701d18ed9d1c49ecf6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "FK_d35bdfc9ff116d456dcad4a580e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_answers" DROP CONSTRAINT "FK_99e896a1f456d0c543c5c83a3da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_answers" DROP CONSTRAINT "FK_dee6f59898d0eba8096910456cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "FK_7687919bf054bf262c669d3ae21"`,
    );
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`DROP TABLE "game_question"`);
    await queryRunner.query(`DROP TABLE "game"`);
    await queryRunner.query(`DROP TABLE "player_answers"`);
    await queryRunner.query(`DROP TABLE "player"`);
  }
}
