import { Dispatch } from 'redux';

import { SurveyQuestionInfo } from '../back/common/public-events/survey-question';

export type InfoLoaded = {
  type: '@currentQuestion/infoLoaded';
  question: SurveyQuestionInfo;
};

export type InfoReset = {
  type: '@currentQuestion/infoReset';
};

export type ActionType = InfoLoaded | InfoReset;

export const Actions = {
  infoLoaded: (question: SurveyQuestionInfo) => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentQuestion/infoLoaded',
        question,
      });
    };
  },
  infoReset: () => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentQuestion/infoReset',
      });
    };
  },
};
