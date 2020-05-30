import { History } from 'history';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import { authReducer } from '../reducers/auth';
import { currentEventReducer } from '../reducers/current-event';

export const createRootReducer = (history: History<any>) => {
  return combineReducers({
    router: connectRouter(history),
    auth: authReducer,
    currentEvent: currentEventReducer,
    // visitorInfo: visitorInfoReducer,
    // eventInfo: eventInfoReducer,
  });
};
