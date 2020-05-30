import { RouterState } from 'connected-react-router';

import { UserInfo, WebUISettings } from '../back/common/users';
import { PublicEventInfo } from '../back/common/public-events/event';

export type AuthState = {
  user: UserInfo | null;
  inProgress: boolean;
  uiSettings: WebUISettings;
};

export type CurrentEventState = {
  event: PublicEventInfo | null;
}

export type AppState = {
  router: RouterState;
  auth: AuthState;
  currentEvent: CurrentEventState;
};
