import { Dispatch } from 'redux';

import { SurveyInfo } from '../back/common/public-events/survey';

export type SurveyInfoLoaded = {
  type: '@currentSurvey/surveyInfoLoaded';
  survey: SurveyInfo;
};

export type SurveyInfoReset = {
  type: '@currentSurvey/surveyInfoReset';
};

export type ActionType = SurveyInfoLoaded | SurveyInfoReset;

export const Actions = {
  surveyInfoLoaded: (survey: SurveyInfo) => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentSurvey/surveyInfoLoaded',
        survey,
      });
    };
  },
  surveyInfoReset: () => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentSurvey/surveyInfoReset',
      });
    };
  },
};
