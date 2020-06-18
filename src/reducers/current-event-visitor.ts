import { produce, Draft } from 'immer';

import { ActionType } from '../actions/current-event-visitor';
import { CurrentEventVisitorState } from '../store/state';

const initialState: CurrentEventVisitorState = {
  visitor: null,
};

export const currentEventVisitorReducer = produce(
  (draft: Draft<CurrentEventVisitorState> = initialState, action: ActionType) => {
    switch (action.type) {
      case '@currentEventVisitor/infoLoaded':
        draft.visitor = action.visitor;
        break;
      case '@currentEventVisitor/infoReset':
        draft.visitor = null;
        break;
    }

    return draft;
  },
);
