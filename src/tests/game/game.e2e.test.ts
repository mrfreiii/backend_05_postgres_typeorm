import { SETTINGS } from "../../settings";
import { createTestPublishedQuestions } from "../questions/helpers";
import { createTestUsers, getUsersJwtTokens } from "../users/helpers";
import { connectToTestDBAndClearRepositories, req } from "../helpers";
import { GameStatusEnum } from "../../modules/quiz-game/game/enums/gameStatus.enum";
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
        answers: [],
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

  it("should return an active game with second player", async () => {
    const res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: { id: user1.id, login: user1.login },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
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

  it("should return 403 for attempt to connect when game is started ", async () => {
    const user1Res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(403);
    const user2Res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(403);

    expect(user1Res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "User already have a game",
    });
    expect(user2Res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "User already have a game",
    });
  });

  it("should return 403 for attempt to connect when after 1st player answered to all questions but 2nd not yet", async () => {
    await req // 1st question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    await req // 2nd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    await req // 3rd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    await req // 4th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    await req // 5th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);

    const user1Res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(403);
    const user2Res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(403);

    expect(user1Res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "User already have a game",
    });
    expect(user2Res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "User already have a game",
    });
  });

  it("should connect users to new game after 2nd player answered to all questions", async () => {
    await req // 1st question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    await req // 2nd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    await req // 3rd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    await req // 4th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    await req // 5th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);

    await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);
    const res = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: { id: user2.id, login: user2.login },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: { id: user1.id, login: user1.login },
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
  connectToTestDBAndClearRepositories(true);

  let tokens: string[];

  beforeAll(async () => {
    const users = await createTestUsers({ count: 16 });
    tokens = await getUsersJwtTokens(users);

    await createTestPublishedQuestions(10);
  });

  it("should create only 4 games for 8 users with parallel requests", async () => {
    const promises = [
      req // 1
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${tokens[0]}`)
        .expect(200),
      req // 2
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${tokens[1]}`)
        .expect(200),
      req // 3
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${tokens[2]}`)
        .expect(200),
      req // 4
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${tokens[3]}`)
        .expect(200),
      req // 5
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${tokens[4]}`)
        .expect(200),
      req // 6
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${tokens[5]}`)
        .expect(200),
      req // 7
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${tokens[6]}`)
        .expect(200),
      req // 8
        .post(`${SETTINGS.PATH.GAMES}/connection`)
        .set("Authorization", `Bearer ${tokens[7]}`)
        .expect(200),
    ];

    const res = await Promise.all(promises);

    const gamesIds = [
      ...new Set([
        res[0].body.id,
        res[1].body.id,
        res[2].body.id,
        res[3].body.id,
        res[4].body.id,
        res[5].body.id,
        res[6].body.id,
        res[7].body.id,
      ]),
    ];

    expect(gamesIds.length).toBe(4);
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

  it("should return 404 for no active game (for 2nd player that is not connected yet)", async () => {
    const res = await req
      .get(`${SETTINGS.PATH.GAMES}/my-current`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(404);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "There is no active game for current user",
    });
  });

  it("should return game (awaiting second player)", async () => {
    await req
      .get(`${SETTINGS.PATH.GAMES}/my-current`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);
  });

  it("should return game (second player connected)", async () => {
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

  it("should return 404 after finished game", async () => {
    // Send answers for 1st player
    await req // 2nd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "any value" })
      .expect(200);
    await req // 3rd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "any value" })
      .expect(200);
    await req // 4th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "any value" })
      .expect(200);
    await req // 5th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "any value" })
      .expect(200);

    // Send answers for 2nd player
    await req // 2nd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "any value" })
      .expect(200);
    await req // 3rd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "any value" })
      .expect(200);
    await req // 4th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "any value" })
      .expect(200);
    await req // 5th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "any value" })
      .expect(200);

    await req
      .get(`${SETTINGS.PATH.GAMES}/my-current`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(404);

    await req
      .get(`${SETTINGS.PATH.GAMES}/my-current`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(404);
  });
});

describe("send answer to questions (only 1st player answers) /my-current/answers", () => {
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

    // connect 1s user to game
    await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);
  });

  it("should return 401 for request without auth header", async () => {
    await req.post(`${SETTINGS.PATH.GAMES}/my-current/answers`).expect(401);
  });

  it("should return 403 for no active game (awaiting 2nd player)", async () => {
    const res = await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "any answer" })
      .expect(403);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "There is no active game for current user",
    });
  });

  it("should return 0 score for all incorrect answers but finished first", async () => {
    const gameRes = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);

    game1 = gameRes.body;

    // answer #1
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #2
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #3
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #4
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #5
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);

    const checkRes = await req
      .get(`${SETTINGS.PATH.GAMES}/${game1.id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);

    expect(checkRes.body).toEqual({
      id: game1.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: game1?.questions?.[0].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[1].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[2].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[3].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[4].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user1.id, login: user1.login },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
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

  it("should return 403 for attempt sending answer after all answered questions", async () => {
    const res = await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "any answer" })
      .expect(403);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "User already answer to all questions",
    });
  });

  it("should return 1 score for 2nd player with 1 correct answer", async () => {
    const correctAnswerForFirstQuestion = questionsWithAnswers.find((qwa) => {
      return qwa.id === game1?.questions?.[0].id;
    })?.correctAnswers[0];

    // answer #1
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: correctAnswerForFirstQuestion })
      .expect(200);
    // answer #2
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #3
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #4
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #5
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);

    const checkRes = await req
      .get(`${SETTINGS.PATH.GAMES}/${game1.id}`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);

    expect(checkRes.body).toEqual({
      id: game1.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: game1?.questions?.[0].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[1].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[2].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[3].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[4].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user1.id, login: user1.login },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: game1?.questions?.[0].id,
            answerStatus: "Correct",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[1].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[2].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[3].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[4].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user2.id, login: user2.login },
        score: 1,
      },
      questions: game1?.questions,
      status: GameStatusEnum.Finished,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: expect.any(String),
    });
  });
});

describe("send answer to questions (two players answer sequentially) /my-current/answers", () => {
  connectToTestDBAndClearRepositories();

  let user1: UserViewDtoPg;
  let user2: UserViewDtoPg;
  let user1Token: string;
  let user2Token: string;

  let game1: GameViewDtoTypeorm;
  let correctAnswerForFirstQuestion: string | undefined;

  beforeAll(async () => {
    const users = await createTestUsers({ count: 3 });
    user1 = users[0];
    user2 = users[1];

    const tokens = await getUsersJwtTokens(users);
    user1Token = tokens[0];
    user2Token = tokens[1];

    const questionsWithAnswers = await createTestPublishedQuestions(5);

    // connect users to game
    await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);
    const gameRes = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);

    game1 = gameRes.body;

    correctAnswerForFirstQuestion = questionsWithAnswers.find((qwa) => {
      return qwa.id === game1?.questions?.[0].id;
    })?.correctAnswers[0];
  });

  it("should return 1 score for one correct answer and other incorrect", async () => {
    // answer #1
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: correctAnswerForFirstQuestion })
      .expect(200);
    // answer #2
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #3
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #4
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #5
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);

    const checkRes = await req
      .get(`${SETTINGS.PATH.GAMES}/${game1.id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);

    expect(checkRes.body).toEqual({
      id: game1.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: game1?.questions?.[0].id,
            answerStatus: "Correct",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[1].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[2].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[3].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[4].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user1.id, login: user1.login },
        score: 1,
      },
      secondPlayerProgress: {
        answers: [],
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

  it("should finish game after 2nd player answers to all questions and add 1 score for 1st player due to finished first", async () => {
    // answer #1
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: correctAnswerForFirstQuestion })
      .expect(200);
    // answer #2
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #3
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #4
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);
    // answer #5
    await req
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: "incorrect answer" })
      .expect(200);

    const checkRes = await req
      .get(`${SETTINGS.PATH.GAMES}/${game1.id}`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);

    expect(checkRes.body).toEqual({
      id: game1.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: game1?.questions?.[0].id,
            answerStatus: "Correct",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[1].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[2].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[3].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[4].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user1.id, login: user1.login },
        score: 2,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: game1?.questions?.[0].id,
            answerStatus: "Correct",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[1].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[2].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[3].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
          {
            questionId: game1?.questions?.[4].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String),
          },
        ],
        player: { id: user2.id, login: user2.login },
        score: 1,
      },
      questions: game1?.questions,
      status: GameStatusEnum.Finished,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: expect.any(String),
    });
  });
});

describe("send answer to questions (two players answer in parallel) /my-current/answers", () => {
  connectToTestDBAndClearRepositories();

  let user1Token: string;
  let user2Token: string;

  let game1: GameViewDtoTypeorm;
  let correctAnswer1: string | undefined;
  let correctAnswer2: string | undefined;
  let correctAnswer3: string | undefined;
  let correctAnswer4: string | undefined;
  let correctAnswer5: string | undefined;

  beforeAll(async () => {
    const users = await createTestUsers({ count: 3 });
    const tokens = await getUsersJwtTokens(users);
    user1Token = tokens[0];
    user2Token = tokens[1];

    const questionsWithAnswers = await createTestPublishedQuestions(5);

    // connect users to game
    await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);
    const gameRes = await req
      .post(`${SETTINGS.PATH.GAMES}/connection`)
      .set("Authorization", `Bearer ${user2Token}`)
      .expect(200);

    game1 = gameRes.body;

    correctAnswer1 = questionsWithAnswers.find((qwa) => {
      return qwa.id === game1?.questions?.[0].id;
    })?.correctAnswers[0];
    correctAnswer2 = questionsWithAnswers.find((qwa) => {
      return qwa.id === game1?.questions?.[1].id;
    })?.correctAnswers[0];
    correctAnswer3 = questionsWithAnswers.find((qwa) => {
      return qwa.id === game1?.questions?.[2].id;
    })?.correctAnswers[0];
    correctAnswer4 = questionsWithAnswers.find((qwa) => {
      return qwa.id === game1?.questions?.[3].id;
    })?.correctAnswers[0];
    correctAnswer5 = questionsWithAnswers.find((qwa) => {
      return qwa.id === game1?.questions?.[4].id;
    })?.correctAnswers[0];
  });

  it("should return total 11 score because all players answer correctly to all questions and 1 player finish first", async () => {
    // player1 answers (4 questions)
    await req // 1st question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: correctAnswer1 })
      .expect(200);
    await req // 2nd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: correctAnswer2 })
      .expect(200);
    await req // 3rd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: correctAnswer3 })
      .expect(200);
    await req // 4th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ answer: correctAnswer4 })
      .expect(200);

    // player2 answers (4 questions)
    await req // 1st question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: correctAnswer1 })
      .expect(200);
    await req // 2nd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: correctAnswer2 })
      .expect(200);
    await req // 3rd question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: correctAnswer3 })
      .expect(200);
    await req // 4th question
      .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ answer: correctAnswer4 })
      .expect(200);

    // Two players parallel answers for 5th question
    await Promise.all([
      req
        .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ answer: correctAnswer5 })
        .expect(200),
      req
        .post(`${SETTINGS.PATH.GAMES}/my-current/answers`)
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ answer: correctAnswer5 })
        .expect(200),
    ]);

    const checkRes = await req
      .get(`${SETTINGS.PATH.GAMES}/${game1.id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .expect(200);

    const player1Score = checkRes.body.firstPlayerProgress.score;
    const player2Score = checkRes.body.secondPlayerProgress.score;
    const totalScore = player1Score + player2Score;

    expect(totalScore).toBe(11);
    expect(checkRes.body.finishGameDate).toEqual(expect.any(String));

    const lastAnswerDatePlayer1 =
      checkRes.body.firstPlayerProgress.answers[4].addedAt;
    const lastAnswerDatePlayer2 =
      checkRes.body.secondPlayerProgress.answers[4].addedAt;

    const timestampLastAnswerPlayer1 = new Date(
      lastAnswerDatePlayer1,
    ).getTime();
    const timestampLastAnswerPlayer2 = new Date(
      lastAnswerDatePlayer2,
    ).getTime();

    if (timestampLastAnswerPlayer1 < timestampLastAnswerPlayer2) {
      expect(checkRes.body.firstPlayerProgress.score).toBe(6);
      expect(checkRes.body.secondPlayerProgress.score).toBe(5);
    } else {
      expect(checkRes.body.firstPlayerProgress.score).toBe(5);
      expect(checkRes.body.secondPlayerProgress.score).toBe(6);
    }
  });
});
