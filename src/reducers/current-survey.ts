import { produce, Draft } from 'immer';

import { ActionType } from '../actions/current-survey';
import { CurrentSurveyState } from '../store/state';

const initialState: CurrentSurveyState = {
  survey: null,
};

export const currentSurveyReducer = produce(
  (draft: Draft<CurrentSurveyState> = initialState, action: ActionType) => {
    switch (action.type) {
      case '@currentSurvey/surveyInfoLoaded':
        draft.survey = action.survey;
        break;
      case '@currentSurvey/surveyInfoReset':
        draft.survey = null;
        break;
    }

    return draft;
  },
);
