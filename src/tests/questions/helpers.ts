import { SETTINGS } from "../../settings";
import { req, testBasicAuthHeader } from "../helpers";
import {
    QuestionViewDto
} from "../../modules/quiz-game/questions/api/view-dto/questions.view-dto";
import {
    CreateQuestionInputDto
} from "../../modules/quiz-game/questions/api/input-dto/create-question.input-dto";

export const createTestQuestions = async (
    count: number = 1,
): Promise<QuestionViewDto[]> => {
    const result: QuestionViewDto[] = [];

    for (let i = 0; i < count; i++) {
        const uniqueId = Number(Date.now()).toString().substring(4);

        const newQuestion: CreateQuestionInputDto = {
            body: `question ${i + 1}${uniqueId}`,
            correctAnswers: [`answer1 ${i + 1}${uniqueId}`,`answer2 ${i + 1}${uniqueId}`],
        };

        const res = await req
            .post(SETTINGS.PATH.QUESTIONS_ADMIN)
            .set("Authorization", testBasicAuthHeader)
            .send(newQuestion)
            .expect(201);
        result.push(res.body);
    }

    return result;
};
