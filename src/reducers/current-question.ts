import { produce, Draft } from 'immer';

import { ActionType } from '../actions/current-question';
import { CurrentQuestionState } from '../store/state';

const initialState: CurrentQuestionState = {
  question: null,
};

export const currentQuestionReducer = produce(
  (draft: Draft<CurrentQuestionState> = initialState, action: ActionType) => {
    switch (action.type) {
      case '@currentQuestion/infoLoaded':
        draft.question = action.question;
        break;
      case '@currentQuestion/infoReset':
        draft.question = null;
        break;
    }

    return draft;
  },
);
