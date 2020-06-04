import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Redirect, Switch, RouteProps } from 'react-router-dom';

import { configureStore, history } from './store';

import NotFound from './components/NotFound';
import Login from './components/Login';
import Logout from './components/Logout';
import SignUp from './components/SignUp';
import ForgottenPassword from './components/ForgottenPassword';

import Home from './components/Home';
import Overview from './components/Overview/Overview';

import RootView from './components/RootView/RootView';
import ServiceLink from './components/ServiceLinks/ServiceLink';
import ConfirmEmail from './components/ServiceLinks/ConfirmEmail';
import ResetPassword from './components/ServiceLinks/ResetPassword';

import Profile from './components/UserProfile/Profile';
import EventsRoot from './components/PublicEvents/EventsRoot';
import Event from './components/PublicEvents/Event/Event';
import Survey from './components/PublicEvents/Survey/Survey';
import SurveyQuestion from './components/PublicEvents/Survey/Question';

import Page1 from './components/Page1';
import Page2 from './components/Page2';
import Page3 from './components/Page3';
import Page4 from './components/Page4';

const store = configureStore();

function App() {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <RootView>
          <Switch>
            <Route
              path="/"
              exact
              component={() =>
                store.getState().auth.user ? (
                  <Redirect to={'/overview'} />
                ) : (
                  <Redirect to={'/home'} />
                )
              }
            />

            <Route path="/home" component={Home} />
            <PrivateRoute path="/overview" component={Overview} />

            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/signup" component={SignUp} />
            <Route path="/forgotten-password" component={ForgottenPassword} />
            <PrivateRoute path="/profile" component={Profile} />

            <PrivateRoute path="/public-events" component={EventsRoot} />
            <PrivateRoute path="/public-event/:eventId" component={Event} />
            <PrivateRoute
              path="/public-event-survey/:surveyId"
              component={Survey}
            />
            <PrivateRoute
              path="/public-event-survey-question/:questionId"
              component={SurveyQuestion}
            />

            <Route path="/service-link/:linkType" component={ServiceLink} />
            <Route path="/confirm-email/:token" component={ConfirmEmail} />
            <Route path="/reset-password/:token" component={ResetPassword} />

            <Route path="/page1" component={Page1} />
            <Route path="/page2" component={Page2} />
            <Route path="/page3" component={Page3} />
            <Route path="/page4" component={Page4} />

            <Route component={NotFound} />
          </Switch>
        </RootView>
      </ConnectedRouter>
    </Provider>
  );
}

export default App;

const PrivateRoute: React.FC<RouteProps> = ({
  component: Component,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => {
      ///////////////////////
      // console.log(props.location);
      //////////////////
      if (store.getState().auth.user) {
        // @ts-ignore
        return <Component {...props} />;
      }

      return (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location },
          }}
        />
      );
    }}
  />
);
