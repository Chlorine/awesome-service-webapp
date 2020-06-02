import { produce, Draft } from 'immer';

import { ActionType } from '../actions/current-event';
import { CurrentEventState } from '../store/state';

const initialState: CurrentEventState = {
  event: null,
};

export const currentEventReducer = produce(
  (draft: Draft<CurrentEventState> = initialState, action: ActionType) => {
    switch (action.type) {
      case '@currentEvent/eventInfoLoaded':
        draft.event = action.event;
        break;
      case '@currentEvent/eventInfoReset':
        draft.event = null;
        break;
    }

    return draft;
  },
);
