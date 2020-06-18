import { History } from 'history';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import { authReducer } from '../reducers/auth';
import { currentEventReducer } from '../reducers/current-event';
import { currentSurveyReducer } from '../reducers/current-survey';
import { currentQuestionReducer } from '../reducers/current-question';
import { currentEventVisitorReducer } from '../reducers/current-event-visitor';

export const createRootReducer = (history: History<any>) => {
  return combineReducers({
    router: connectRouter(history),
    auth: authReducer,
    currentEvent: currentEventReducer,
    currentSurvey: currentSurveyReducer,
    currentQuestion: currentQuestionReducer,
    currentEventVisitor: currentEventVisitorReducer,
  });
};
