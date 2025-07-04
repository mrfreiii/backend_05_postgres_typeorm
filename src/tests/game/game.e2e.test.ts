import { SETTINGS } from "../../settings";
import { createTestPublishedQuestions } from "../questions/helpers";
import { createTestUsers, getUsersJwtTokens } from "../users/helpers";
import { connectToTestDBAndClearRepositories, req } from "../helpers";
import { GameViewDtoTypeorm } from "../../modules/quiz-game/game/api/view-dto/game.view-dto.pg";
import { UserViewDtoPg } from "../../modules/user-accounts/users/api/view-dto/users.view-dto.pg";
import { QuestionViewDto } from "../../modules/quiz-game/questions/api/view-dto/questions.view-dto";

describe("connects to game (sequential requests) /connection", () => {
  connectToTestDBAndClearRepositories();

  let user1: UserViewDtoPg;
  let user2: UserViewDtoPg;
  let user1Token: string;
  let user2Token: string;

  beforeAll(async () => {
    const users = await createTestUsers({ count: 2 });
    user1 = users[0];
    user2 = users[1];

    const tokens = await getUsersJwtTokens(users);
    user1Token = tokens[0];
    user2Token = tokens[1];

    await createTestPublishedQuestions(10);
  });

  it("should return 401 for request without auth header", async () => {
    await req.post(`${SETTINGS.PATH.GAMES}/connection`).expect(401);
  });

  it("should return a game with awaiting a second player", async () => {
    const res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: null,
        player: { id: user1.id, login: user1.login },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: "PendingSecondPlayer",
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });
  });

  it("should return 403 because user already have an active game", async () => {
    const res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(403);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "User already have a game",
    });
  });

  it("should return an active game with second player", async () => {
    const res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: null,
        player: { id: user1.id, login: user1.login },
        score: 0,
      },
      secondPlayerProgress: {
        answers: null,
        player: { id: user2.id, login: user2.login },
        score: 0,
      },
      questions: [
        { id: expect.any(String), body: expect.any(String) },
        { id: expect.any(String), body: expect.any(String) },
        { id: expect.any(String), body: expect.any(String) },
        { id: expect.any(String), body: expect.any(String) },
        { id: expect.any(String), body: expect.any(String) },
      ],
      status: "Active",
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });
});

describe("connects to game (parallel requests) /connection", () => {
  connectToTestDBAndClearRepositories();

  let user1Token: string;
  let user2Token: string;
  let user3Token: string;
  let user4Token: string;

  beforeAll(async () => {
    const users = await createTestUsers({ count: 4 });
    const tokens = await getUsersJwtTokens(users);
    user1Token = tokens[0];
    user2Token = tokens[1];
    user3Token = tokens[2];
    user4Token = tokens[3];

    await createTestPublishedQuestions(10);
  });

  it("should create only 2 games for 4 users with parallel requests", async () => {
    const promises = [
      req
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200),
      req
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(200),
      req
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${user3Token}`)
        .expect(200),
      req
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${user4Token}`)
        .expect(200),
    ];

    const res = await Promise.all(promises);

    const gamesIds = [
      ...new Set([
        res[0].body.id,
        res[1].body.id,
        res[2].body.id,
        res[3].body.id,
      ]),
    ];

    expect(gamesIds.length).toBe(2);
  });
});

describe("get game by id /:id", () => {
  connectToTestDBAndClearRepositories();

  let user1: UserViewDtoPg;
  let user2: UserViewDtoPg;
  let user1Token: string;
  let user2Token: string;

  let game1: GameViewDtoTypeorm;
  let game2: GameViewDtoTypeorm;

  const nonExistentGameId = "72ed23b5-957e-4728-aebd-584a141ec668";
  let questionsWithAnswers: QuestionViewDto[];

  beforeAll(async () => {
    const users = await createTestUsers({ count: 3 });
    user1 = users[0];
    user2 = users[1];

    const tokens = await getUsersJwtTokens(users);
    user1Token = tokens[0];
    user2Token = tokens[1];
    const user3Token = tokens[2];

    questionsWithAnswers = await createTestPublishedQuestions(5);

    // connect 1st user to game
    await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);
    // connect 2nd user to game
    const game1Res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);
    // connect 3rd user to another game
    const game2Res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user3Token}`)
      .expect(200);

    game1 = game1Res.body;
    game2 = game2Res.body;

    const correctAnswerForFirstQuestion = questionsWithAnswers.find((qwa) => {
      return qwa.id === game1?.questions?.[0].id;
    })?.correctAnswers[0];

    // Send correct answer for 1st question by 1st user
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: correctAnswerForFirstQuestion })
      .expect(200);
    // Send incorrect answer for 1st question by 2nd user
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
  });

  it("should return 401 for request without auth header", async () => {
    await req.get(`${SETTINGS.PATH.GAMES}/${nonExistentGameId}`).expect(401);
  });

  it("should return 404 for non existent game", async () => {
    const res = await req
      .get(`${SETTINGS.PATH.GAMES}/${nonExistentGameId}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(404);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "Game not found",
    });
  });

  it("should return 403 for attempt to get game of other users", async () => {
    const res = await req
      .get(`${SETTINGS.PATH.GAMES}/${game2.id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(403);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "The game does not belong to the user",
    });
  });

  it("should return 400 for incorrect id format", async () => {
    const res = await req
      .get(`${SETTINGS.PATH.GAMES}/7777`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(400);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "id",
      message: "Id has incorrect format",
    });
  });

  it("should return game", async () => {
    const res = await req
      .get(`${SETTINGS.PATH.GAMES}/${game1.id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: game1.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: game1?.questions?.[0].id,
            answerStatus: "Correct",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user1.id, login: user1.login },
        score: 1,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: game1?.questions?.[0].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user2.id, login: user2.login },
        score: 0,
      },
      questions: game1?.questions,
      status: "Active",
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });
});

describe("get current active game for user /my-current", () => {
  connectToTestDBAndClearRepositories();

  let user1: UserViewDtoPg;
  let user2: UserViewDtoPg;
  let user1Token: string;
  let user2Token: string;

  let game1: GameViewDtoTypeorm;
  let questionsWithAnswers: QuestionViewDto[];

  beforeAll(async () => {
    const users = await createTestUsers({ count: 3 });
    user1 = users[0];
    user2 = users[1];

    const tokens = await getUsersJwtTokens(users);
    user1Token = tokens[0];
    user2Token = tokens[1];

    questionsWithAnswers = await createTestPublishedQuestions(5);

    // connect 1st user to game (awaiting 2nd player)
    const game1Res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);

    game1 = game1Res.body;
  });

  it("should return 401 for request without auth header", async () => {
    await req.get(`${SETTINGS.PATH.GAMES}/my-current`).expect(401);
  });

  it("should return 404 for no active game (not created)", async () => {
    const res = await req
      .get(`${SETTINGS.PATH.GAMES}/my-current`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(404);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "There is no active game for current user",
    });
  });

  it("should return 404 for no active game (awaiting second player)", async () => {
    const res = await req
      .get(`${SETTINGS.PATH.GAMES}/my-current`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(404);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "There is no active game for current user",
    });
  });

  it("should return game", async () => {
    // Connect 2nd player
    const gameRes = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);

    const correctAnswerForFirstQuestion = questionsWithAnswers.find((qwa) => {
      return qwa.id === gameRes.body?.questions?.[0].id;
    })?.correctAnswers[0];

    // Send correct answer for 1st question by 1st user
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: correctAnswerForFirstQuestion })
      .expect(200);
    // Send incorrect answer for 1st question by 2nd user
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);

    const res = await req
      .get(`${SETTINGS.PATH.GAMES}/my-current`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: game1.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: gameRes.body?.questions?.[0].id,
            answerStatus: "Correct",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user1.id, login: user1.login },
        score: 1,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: gameRes.body?.questions?.[0].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user2.id, login: user2.login },
        score: 0,
      },
      questions: gameRes.body?.questions,
      status: "Active",
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });
});
