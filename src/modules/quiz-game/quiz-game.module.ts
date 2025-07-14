import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserAccountsModule } from "../user-accounts/user-accounts.module";

import { Game } from "./game/entity/game.entity.typeorm";
import { Player } from "./game/entity/player.entity.typeorm";
import { Question } from "./questions/entity/question.entity.typeorm";
import { GameQuestion } from "./game/entity/gameQuestions.entity.typeorm";
import { PlayerAnswers } from "./game/entity/playerAnswers.entity.typeorm";

import { GamesController } from "./game/api/games.controller";
import { QuestionsAdminController } from "./questions/api/questions-admin.controller";

import { QuestionsRepository } from "./questions/infrastructure/questions.repository";
import { QuestionsQueryRepository } from "./questions/infrastructure/query/questions.query-repository";

import { DeleteQuestionCommandHandler } from "./questions/application/usecases/delete-question.usecase";
import { CreateQuestionCommandHandler } from "./questions/application/usecases/create-question.usecase";
import { UpdateQuestionCommandHandler } from "./questions/application/usecases/update-question.usecase";
import { UpdatePublishedStatusCommandHandler } from "./questions/application/usecases/update-published-status.usecase";
import { ConnectUserToGameOrCreateGameCommandHandler } from "./game/application/usecases/connect-user-to-game-or-create-game.usecase";
import { GamesRepository } from "./game/infrastructure/games.repository";
import { PlayersRepository } from "./game/infrastructure/players.repository";
import { GamesQueryRepository } from "./game/infrastructure/query/games.query-repository";
import { AddPlayerAnswerCommandHandler } from "./game/application/usecases/add-player-answer.usecase";
import { PlayerAnswersRepository } from "./game/infrastructure/playerAnswers.repository";
import { PlayerAnswersQueryRepository } from "./game/infrastructure/query/playerAnswers.query-repository";
import { PlayersQueryRepository } from "./game/infrastructure/query/players.query-repository";
import { GameScheduleService } from "./game/application/game-schedule.service";

const commandHandlers = [
  CreateQuestionCommandHandler,
  DeleteQuestionCommandHandler,
  UpdateQuestionCommandHandler,
  AddPlayerAnswerCommandHandler,
  UpdatePublishedStatusCommandHandler,
  ConnectUserToGameOrCreateGameCommandHandler,
];

const controllers = [QuestionsAdminController, GamesController];

const services = [GameScheduleService];

const repos = [
  QuestionsRepository,
  QuestionsQueryRepository,
  GamesRepository,
  GamesQueryRepository,
  PlayersRepository,
  PlayersQueryRepository,
  PlayerAnswersRepository,
  PlayerAnswersQueryRepository,
];

const typeorm_entities = [Question, Game, GameQuestion, Player, PlayerAnswers];

@Module({
  imports: [
    UserAccountsModule,
    TypeOrmModule.forFeature([...typeorm_entities]),
  ],
  controllers: [...controllers],
  providers: [...commandHandlers, ...services, ...repos],
  exports: [TypeOrmModule.forFeature([...typeorm_entities])],
})
export class QuizGameModule {}
