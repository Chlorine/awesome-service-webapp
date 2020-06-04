import { RouterState } from 'connected-react-router';

import { UserInfo, WebUISettings } from '../back/common/users';
import { PublicEventInfo } from '../back/common/public-events/event';
import { SurveyInfo } from '../back/common/public-events/survey';
import { SurveyQuestionInfo } from '../back/common/public-events/survey-question';

export type AuthState = {
  user: UserInfo | null;
  inProgress: boolean;
  uiSettings: WebUISettings;
};

export type CurrentEventState = {
  event: PublicEventInfo | null;
};

export type CurrentSurveyState = {
  survey: SurveyInfo | null;
};

export type CurrentQuestionState = {
  question: SurveyQuestionInfo | null;
};

export type AppState = {
  router: RouterState;
  auth: AuthState;
  currentEvent: CurrentEventState;
  currentSurvey: CurrentSurveyState;
  currentQuestion: CurrentQuestionState;
};
