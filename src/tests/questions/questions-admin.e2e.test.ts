import {
  req,
  testBasicAuthHeader,
  connectToTestDBAndClearRepositories,
} from "../helpers";
import { SETTINGS } from "../../settings";
import { createTestQuestions } from "./helpers";
import { SortDirection } from "../../core/dto/base.query-params.input-dto";
import { convertObjectToQueryString } from "../../utils/convertObjectToQueryString";
import { QuestionViewDto } from "../../modules/quiz-game/questions/api/view-dto/questions.view-dto";
import { QuestionPublishedStatusEnum } from "../../modules/quiz-game/questions/enums/questions.enum";
import { CreateQuestionInputDto } from "../../modules/quiz-game/questions/api/input-dto/create-question.input-dto";
import { UpdateQuestionInputDto } from "../../modules/quiz-game/questions/api/input-dto/update-question.input-dto";
import { GetBlogsQueryParams } from "../../modules/bloggers-platform/blogs/api/input-dto/get-blogs-query-params.input-dto";
import { GetQuestionsQueryParams } from "../../modules/quiz-game/questions/api/input-dto/get-questions-query-params.input-dto";
import { UpdatePublishedStatusInputDto } from "../../modules/quiz-game/questions/api/input-dto/update-published-status.input-dto";

describe("create question /sa/quiz/questions", () => {
  connectToTestDBAndClearRepositories();

  it("should return 401 for request without basic auth header", async () => {
    await req.post(SETTINGS.PATH.QUESTIONS_ADMIN).send({}).expect(401);
  });

  it("should return 400 for invalid values", async () => {
    const newQuestion: { body: null; correctAnswers: null } = {
      body: null,
      correctAnswers: null,
    };

    const res = await req
      .post(SETTINGS.PATH.QUESTIONS_ADMIN)
      .set("Authorization", testBasicAuthHeader)
      .send(newQuestion)
      .expect(400);

    expect(res.body.errorsMessages.length).toBe(2);
    expect(res.body.errorsMessages).toEqual([
      {
        field: "body",
        message: "body must be a string; Received value: null",
      },
      {
        field: "correctAnswers",
        message:
          "each value in correctAnswers must be a string; Received value: null",
      },
    ]);
  });

  it("should create a question", async () => {
    const newQuestion: CreateQuestionInputDto = {
      body: "один плюс один",
      correctAnswers: ["2", "two"],
    };

    const res = await req
      .post(SETTINGS.PATH.QUESTIONS_ADMIN)
      .set("Authorization", testBasicAuthHeader)
      .send(newQuestion)
      .expect(201);

    expect(res.body).toEqual({
      ...newQuestion,
      id: expect.any(String),
      published: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

describe("update question /sa/quiz/questions/:id", () => {
  connectToTestDBAndClearRepositories();

  it("should return 401 for unauthorized user", async () => {
    await req
      .put(`${SETTINGS.PATH.QUESTIONS_ADMIN}/777777`)
      .send({})
      .expect(401);
  });

  it("should return 400 for invalid values", async () => {
    const updatedQuestion: { body: null; correctAnswers: null } = {
      body: null,
      correctAnswers: null,
    };

    const res = await req
      .put(`${SETTINGS.PATH.QUESTIONS_ADMIN}/777777`)
      .set("Authorization", testBasicAuthHeader)
      .send(updatedQuestion)
      .expect(400);

    expect(res.body.errorsMessages.length).toBe(2);
    expect(res.body.errorsMessages).toEqual([
      {
        field: "body",
        message: "body must be a string; Received value: null",
      },
      {
        field: "correctAnswers",
        message:
          "each value in correctAnswers must be a string; Received value: null",
      },
    ]);
  });

  it("should return 404 for non existent question", async () => {
    const updatedQuestion: UpdateQuestionInputDto = {
      body: "один плюс один",
      correctAnswers: ["2", "two"],
    };

    const res = await req
      .put(`${SETTINGS.PATH.QUESTIONS_ADMIN}/777777`)
      .set("Authorization", testBasicAuthHeader)
      .send(updatedQuestion)
      .expect(404);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "Question not found",
    });
  });

  it("should update a question", async () => {
    const createdQuestion = (await createTestQuestions())[0];

    const updatedQuestion: UpdateQuestionInputDto = {
      body: "updated question",
      correctAnswers: ["updated answer 1", "updated answer 2"],
    };

    await req
      .put(`${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestion?.id}`)
      .set("Authorization", testBasicAuthHeader)
      .send(updatedQuestion)
      .expect(204);

    const checkRes = await req
      .get(SETTINGS.PATH.QUESTIONS_ADMIN)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(checkRes.body.items[0]).toEqual({
      ...updatedQuestion,
      id: createdQuestion?.id,
      published: false,
      createdAt: createdQuestion?.createdAt,
      updatedAt: expect.any(String),
    });
  });
});

describe("update question published status /sa/quiz/questions/:id/publish", () => {
  connectToTestDBAndClearRepositories();

  let createdQuestion: QuestionViewDto;

  beforeAll(async () => {
    createdQuestion = (await createTestQuestions())[0];
  });

  it("should return 401 for unauthorized user", async () => {
    await req
      .put(`${SETTINGS.PATH.QUESTIONS_ADMIN}/777777`)
      .send({})
      .expect(401);
  });

  it("should return 400 for invalid values", async () => {
    const updatedStatus: { published: null } = {
      published: null,
    };

    const res = await req
      .put(`${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestion?.id}/publish`)
      .set("Authorization", testBasicAuthHeader)
      .send(updatedStatus)
      .expect(400);

    expect(res.body.errorsMessages.length).toBe(1);
    expect(res.body.errorsMessages).toEqual([
      {
        field: "published",
        message: "published must be a boolean value; Received value: null",
      },
    ]);
  });

  it("should return 404 for non existent question", async () => {
    const updatedStatus: UpdatePublishedStatusInputDto = {
      published: true,
    };

    const res = await req
      .put(`${SETTINGS.PATH.QUESTIONS_ADMIN}/77777/publish`)
      .set("Authorization", testBasicAuthHeader)
      .send(updatedStatus)
      .expect(404);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "Question not found",
    });
  });

  it("should update question published status", async () => {
    const updatedStatus: UpdatePublishedStatusInputDto = {
      published: true,
    };

    await req
      .put(`${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestion?.id}/publish`)
      .set("Authorization", testBasicAuthHeader)
      .send(updatedStatus)
      .expect(204);

    const checkRes = await req
      .get(SETTINGS.PATH.QUESTIONS_ADMIN)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(checkRes.body.items[0]).toEqual({
      ...createdQuestion,
      published: true,
      updatedAt: expect.any(String),
    });
  });
});

describe("delete question /sa/quiz/questions/:id", () => {
  connectToTestDBAndClearRepositories();

  it("should return 401 for unauthorized user", async () => {
    await req.delete(`${SETTINGS.PATH.QUESTIONS_ADMIN}/777777`).expect(401);
  });

  it("should return 404 for non existent question", async () => {
    const res = await req
      .delete(`${SETTINGS.PATH.QUESTIONS_ADMIN}/77777`)
      .set("Authorization", testBasicAuthHeader)
      .expect(404);

    expect(res.body.errorsMessages[0]).toEqual({
      field: "",
      message: "Question not found",
    });
  });

  it("should delete question and get empty array", async () => {
    const createdQuestion = (await createTestQuestions())[0];

    const checkResBefore = await req
      .get(SETTINGS.PATH.QUESTIONS_ADMIN)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(checkResBefore.body.pagesCount).toBe(1);
    expect(checkResBefore.body.page).toBe(1);
    expect(checkResBefore.body.pageSize).toBe(10);
    expect(checkResBefore.body.totalCount).toBe(1);
    expect(checkResBefore.body.items.length).toBe(1);

    await req
      .delete(`${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestion?.id}`)
      .set("Authorization", testBasicAuthHeader)
      .expect(204);

    const checkResAfter = await req
      .get(SETTINGS.PATH.QUESTIONS_ADMIN)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(checkResAfter.body.pagesCount).toBe(0);
    expect(checkResAfter.body.page).toBe(1);
    expect(checkResAfter.body.pageSize).toBe(10);
    expect(checkResAfter.body.totalCount).toBe(0);
    expect(checkResAfter.body.items.length).toBe(0);
  });
});

describe("get all questions sa/quiz/questions", () => {
  connectToTestDBAndClearRepositories();

  let createdQuestions: QuestionViewDto[] = [];

  it("should return 401 for unauthorized user", async () => {
    await req.get(SETTINGS.PATH.QUESTIONS_ADMIN).expect(401);
  });

  it("should get empty array", async () => {
    const res = await req
      .get(SETTINGS.PATH.QUESTIONS_ADMIN)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(res.body.pagesCount).toBe(0);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
    expect(res.body.totalCount).toBe(0);
    expect(res.body.items.length).toBe(0);
  });

  it("should get not empty array without query params", async () => {
    createdQuestions = await createTestQuestions(12);

    const res = await req
      .get(SETTINGS.PATH.QUESTIONS_ADMIN)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(res.body.pagesCount).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
    expect(res.body.totalCount).toBe(12);
    expect(res.body.items.length).toBe(10);

    expect(res.body.items).toEqual([
      createdQuestions[11],
      createdQuestions[10],
      createdQuestions[9],
      createdQuestions[8],
      createdQuestions[7],
      createdQuestions[6],
      createdQuestions[5],
      createdQuestions[4],
      createdQuestions[3],
      createdQuestions[2],
    ]);
  });

  it("should get question with page number and page size", async () => {
    const query: Partial<GetQuestionsQueryParams> = {
      pageNumber: 2,
      pageSize: 2,
    };
    const queryString = convertObjectToQueryString(query);

    const res = await req
      .get(`${SETTINGS.PATH.QUESTIONS_ADMIN}${queryString}`)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(res.body.pagesCount).toBe(6);
    expect(res.body.page).toBe(2);
    expect(res.body.pageSize).toBe(2);
    expect(res.body.totalCount).toBe(12);
    expect(res.body.items.length).toBe(2);

    expect(res.body.items).toEqual([createdQuestions[9], createdQuestions[8]]);
  });

  it("should get questions with sortDirection asc", async () => {
    const query: Partial<GetBlogsQueryParams> = {
      sortDirection: SortDirection.Asc,
    };
    const queryString = convertObjectToQueryString(query);

    const res = await req
      .get(`${SETTINGS.PATH.QUESTIONS_ADMIN}${queryString}`)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(res.body.pagesCount).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
    expect(res.body.totalCount).toBe(12);
    expect(res.body.items.length).toBe(10);

    expect(res.body.items).toEqual([
      createdQuestions[0],
      createdQuestions[1],
      createdQuestions[2],
      createdQuestions[3],
      createdQuestions[4],
      createdQuestions[5],
      createdQuestions[6],
      createdQuestions[7],
      createdQuestions[8],
      createdQuestions[9],
    ]);
  });

  it("should get 1 blogs with bodySearchTerm query", async () => {
    const query: Partial<GetQuestionsQueryParams> = {
      bodySearchTerm: createdQuestions[0].body,
    };
    const queryString = convertObjectToQueryString(query);

    const res = await req
      .get(`${SETTINGS.PATH.QUESTIONS_ADMIN}${queryString}`)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(res.body.pagesCount).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
    expect(res.body.totalCount).toBe(1);
    expect(res.body.items.length).toBe(1);

    expect(res.body.items).toEqual([createdQuestions[0]]);
  });

  it("should get 6 questions with publishedStatus true", async () => {
    const updatedStatus: UpdatePublishedStatusInputDto = {
      published: true,
    };

    await req
      .put(
        `${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestions[0]?.id}/publish`,
      )
      .set("Authorization", testBasicAuthHeader)
      .send(updatedStatus)
      .expect(204);
    await req
      .put(
        `${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestions[1]?.id}/publish`,
      )
      .set("Authorization", testBasicAuthHeader)
      .send(updatedStatus)
      .expect(204);
    await req
      .put(
        `${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestions[2]?.id}/publish`,
      )
      .set("Authorization", testBasicAuthHeader)
      .send(updatedStatus)
      .expect(204);
    await req
      .put(
        `${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestions[3]?.id}/publish`,
      )
      .set("Authorization", testBasicAuthHeader)
      .send(updatedStatus)
      .expect(204);
    await req
      .put(
        `${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestions[4]?.id}/publish`,
      )
      .set("Authorization", testBasicAuthHeader)
      .send(updatedStatus)
      .expect(204);
    await req
      .put(
        `${SETTINGS.PATH.QUESTIONS_ADMIN}/${createdQuestions[5]?.id}/publish`,
      )
      .set("Authorization", testBasicAuthHeader)
      .send(updatedStatus)
      .expect(204);

    const query: Partial<GetQuestionsQueryParams> = {
      publishedStatus: QuestionPublishedStatusEnum.Published,
    };
    const queryString = convertObjectToQueryString(query);

    const res = await req
      .get(`${SETTINGS.PATH.QUESTIONS_ADMIN}${queryString}`)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(res.body.pagesCount).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
    expect(res.body.totalCount).toBe(6);
    expect(res.body.items.length).toBe(6);

    expect(res.body.items).toEqual([
      {
        ...createdQuestions[5],
        published: true,
        updatedAt: expect.any(String),
      },
      {
        ...createdQuestions[4],
        published: true,
        updatedAt: expect.any(String),
      },
      {
        ...createdQuestions[3],
        published: true,
        updatedAt: expect.any(String),
      },
      {
        ...createdQuestions[2],
        published: true,
        updatedAt: expect.any(String),
      },
      {
        ...createdQuestions[1],
        published: true,
        updatedAt: expect.any(String),
      },
      {
        ...createdQuestions[0],
        published: true,
        updatedAt: expect.any(String),
      },
    ]);
  });

  it("should get 6 questions with publishedStatus false", async () => {
    const query: Partial<GetQuestionsQueryParams> = {
      publishedStatus: QuestionPublishedStatusEnum.NotPublished,
    };
    const queryString = convertObjectToQueryString(query);

    const res = await req
      .get(`${SETTINGS.PATH.QUESTIONS_ADMIN}${queryString}`)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(res.body.pagesCount).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
    expect(res.body.totalCount).toBe(6);
    expect(res.body.items.length).toBe(6);

    expect(res.body.items).toEqual([
      createdQuestions[11],
      createdQuestions[10],
      createdQuestions[9],
      createdQuestions[8],
      createdQuestions[7],
      createdQuestions[6],
    ]);
  });

  it("should get 10 questions with publishedStatus all", async () => {
    const query: Partial<GetQuestionsQueryParams> = {
      publishedStatus: QuestionPublishedStatusEnum.All,
    };
    const queryString = convertObjectToQueryString(query);

    const res = await req
      .get(`${SETTINGS.PATH.QUESTIONS_ADMIN}${queryString}`)
      .set("Authorization", testBasicAuthHeader)
      .expect(200);

    expect(res.body.pagesCount).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
    expect(res.body.totalCount).toBe(12);
    expect(res.body.items.length).toBe(10);

    expect(res.body.items).toEqual([
      createdQuestions[11],
      createdQuestions[10],
      createdQuestions[9],
      createdQuestions[8],
      createdQuestions[7],
      createdQuestions[6],
      {
        ...createdQuestions[5],
        published: true,
        updatedAt: expect.any(String),
      },
      {
        ...createdQuestions[4],
        published: true,
        updatedAt: expect.any(String),
      },
      {
        ...createdQuestions[3],
        published: true,
        updatedAt: expect.any(String),
      },
      {
        ...createdQuestions[2],
        published: true,
        updatedAt: expect.any(String),
      },
    ]);
  });
});
