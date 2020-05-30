import { Dispatch } from 'redux';

import { PublicEventInfo } from '../back/common/public-events/event';

export type EventInfoLoaded = {
  type: '@currentEvent/eventInfoLoaded';
  event: PublicEventInfo;
};

export type ActionType = EventInfoLoaded;

export const Actions = {
  eventInfoLoaded: (event: PublicEventInfo) => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentEvent/eventInfoLoaded',
        event,
      });
    };
  },
};
