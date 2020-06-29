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
      case '@currentEvent/eventMediaChanged':
        {
          const { banner, logo } = action.media;
          if (draft.event) {
            if (banner) {
              draft.event.banner = banner;
            }
            if (logo) {
              draft.event.logo = logo;
            }
          }
        }
        break;
    }

    return draft;
  },
);
