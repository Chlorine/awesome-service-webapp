import { Dispatch } from 'redux';

import { SurveyInfo } from '../back/common/public-events/survey';
import { SurveyQuestionInfo } from '../back/common/public-events/survey-question';

export type InfoLoaded = {
  type: '@currentSurvey/infoLoaded';
  survey: SurveyInfo;
};

export type InfoReset = {
  type: '@currentSurvey/infoReset';
};

export type QuestionCreated = {
  type: '@currentSurvey/questionCreated';
  question: SurveyQuestionInfo;
}

export type QuestionRemoved = {
  type: '@currentSurvey/questionRemoved';
  questionId: string;
}

export type QuestionsReordered = {
  type: '@currentSurvey/questionsReordered';
  oldIndex: number;
  newIndex: number;
}

export type ActionType = InfoLoaded | InfoReset | QuestionCreated | QuestionRemoved | QuestionsReordered;

export const Actions = {
  infoLoaded: (survey: SurveyInfo) => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentSurvey/infoLoaded',
        survey,
      });
    };
  },
  infoReset: () => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentSurvey/infoReset',
      });
    };
  },
  questionCreated: (question: SurveyQuestionInfo) => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentSurvey/questionCreated',
        question,
      });
    };
  },
  questionRemoved: (questionId: string) => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentSurvey/questionRemoved',
        questionId,
      });
    };
  },
  questionsReordered: (oldIndex: number, newIndex: number) => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentSurvey/questionsReordered',
        oldIndex,
        newIndex,
      });
    };
  }
};
