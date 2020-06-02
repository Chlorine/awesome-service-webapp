import { Dispatch } from 'redux';

import { PublicEventInfo } from '../back/common/public-events/event';

export type EventInfoLoaded = {
  type: '@currentEvent/eventInfoLoaded';
  event: PublicEventInfo;
};

export type EventInfoReset = {
  type: '@currentEvent/eventInfoReset';
}

export type ActionType = EventInfoLoaded | EventInfoReset;

export const Actions = {
  eventInfoLoaded: (event: PublicEventInfo) => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentEvent/eventInfoLoaded',
        event,
      });
    };
  },
  eventInfoReset: () => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentEvent/eventInfoReset',
      });
    };
  }
};
