import { Dispatch } from 'redux';

import { EventVisitorFullInfo } from '../back/common/public-events/visitor';

export type InfoLoaded = {
  type: '@currentEventVisitor/infoLoaded';
  visitor: EventVisitorFullInfo;
};

export type InfoReset = {
  type: '@currentEventVisitor/infoReset';
};

export type ActionType = InfoLoaded | InfoReset;

export const Actions = {
  infoLoaded: (visitor: EventVisitorFullInfo) => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentEventVisitor/infoLoaded',
        visitor,
      });
    };
  },
  infoReset: () => {
    return (dispatch: Dispatch<ActionType>) => {
      dispatch({
        type: '@currentEventVisitor/infoReset',
      });
    };
  },
};
