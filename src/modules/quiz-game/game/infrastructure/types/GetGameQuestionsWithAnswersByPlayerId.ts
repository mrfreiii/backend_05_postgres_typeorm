type questionWithAnswers = {
  questionId: string;
  questionBody: string;
  questionAnswers: string[];
};

export type GetGameQuestionsWithAnswersByPlayerId = {
  questionsWithAnswers: questionWithAnswers[];
};
