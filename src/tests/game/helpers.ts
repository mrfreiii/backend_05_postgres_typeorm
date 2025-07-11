import { req } from "../helpers";
import { SETTINGS } from "../../settings";
import { QuestionViewDto } from "../../modules/quiz-game/questions/api/view-dto/questions.view-dto";

export const createGame_user1_wins_5_2 = async (dto: {
  questionsWithAnswers: QuestionViewDto[];
  user1Token: string;
  user2Token: string;
}) => {
  const { questionsWithAnswers, user1Token, user2Token } = dto;

  // connect users to game
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/connection`)
    .set("Authorization", `Bearer ${user1Token}`)
    .expect(200);
  const gameRes = await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/connection`)
    .set("Authorization", `Bearer ${user2Token}`)
    .expect(200);

  const game = gameRes.body;

  const correctAnswer1 = questionsWithAnswers.find((qwa) => {
    return qwa.id === game?.questions?.[0].id;
  })?.correctAnswers[0];
  const correctAnswer2 = questionsWithAnswers.find((qwa) => {
    return qwa.id === game?.questions?.[1].id;
  })?.correctAnswers[0];
  const correctAnswer3 = questionsWithAnswers.find((qwa) => {
    return qwa.id === game?.questions?.[2].id;
  })?.correctAnswers[0];
  const correctAnswer4 = questionsWithAnswers.find((qwa) => {
    return qwa.id === game?.questions?.[3].id;
  })?.correctAnswers[0];
  const correctAnswer5 = questionsWithAnswers.find((qwa) => {
    return qwa.id === game?.questions?.[4].id;
  })?.correctAnswers[0];

  // Player1
  // answer #1
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: correctAnswer1 })
    .expect(200);
  // answer #2
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: correctAnswer2 })
    .expect(200);
  // answer #3
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: correctAnswer3 })
    .expect(200);
  // answer #4
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: correctAnswer4 })
    .expect(200);
  // answer #5
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);

  // Player2
  // answer #1
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);
  // answer #2
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);
  // answer #3
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);
  // answer #4
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: correctAnswer4 })
    .expect(200);
  // answer #5
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: correctAnswer5 })
    .expect(200);
};

export const createGame_users_with_draw_score_2 = async (dto: {
  questionsWithAnswers: QuestionViewDto[];
  user1Token: string;
  user2Token: string;
}) => {
  const { questionsWithAnswers, user1Token, user2Token } = dto;

  // connect users to game
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/connection`)
    .set("Authorization", `Bearer ${user1Token}`)
    .expect(200);
  const gameRes = await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/connection`)
    .set("Authorization", `Bearer ${user2Token}`)
    .expect(200);

  const game = gameRes.body;

  const correctAnswer1 = questionsWithAnswers.find((qwa) => {
    return qwa.id === game?.questions?.[0].id;
  })?.correctAnswers[0];
  const correctAnswer4 = questionsWithAnswers.find((qwa) => {
    return qwa.id === game?.questions?.[3].id;
  })?.correctAnswers[0];
  const correctAnswer5 = questionsWithAnswers.find((qwa) => {
    return qwa.id === game?.questions?.[4].id;
  })?.correctAnswers[0];

  // Player1
  // answer #1
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: correctAnswer1 })
    .expect(200);
  // answer #2
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);
  // answer #3
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);
  // answer #4
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);
  // answer #5
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user1Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);

  // Player2
  // answer #1
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);
  // answer #2
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);
  // answer #3
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: "incorrect answer" })
    .expect(200);
  // answer #4
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: correctAnswer4 })
    .expect(200);
  // answer #5
  await req
    .post(`${SETTINGS.PATH.GAMES}/pairs/my-current/answers`)
    .set("Authorization", `Bearer ${user2Token}`)
    .send({ answer: correctAnswer5 })
    .expect(200);
};
