import React from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Actions as AuthActions } from '../../actions/auth';
import { AppState } from '../../store/state';

import { Navbar } from './Navbar';
import { Footer } from './Footer';

import api from '../../back/server-api';

import { CurrentBreakpoint } from '../Common/CurrentBreakpoint';

let _SHOW_CURRENT_BREAKPOINT = process.env.NODE_ENV !== 'production';
_SHOW_CURRENT_BREAKPOINT = false;

const mapStateToProps = (state: AppState) => {
  return {
    auth: state.auth,
    router: state.router,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    children?: any;
  };

declare type State = {
  isCheckingAuth: boolean;
  wsConnected: boolean;
};

class RootView extends React.Component<Props, State> {
  state: State = {
    wsConnected: false,
    isCheckingAuth: true,
  };

  componentDidMount(): void {
    const { authActions } = this.props;

    this.setState({
      isCheckingAuth: true,
    });

    authActions.toggleAuthInProgress(true);

    api
      .checkAuth()
      .then(({ user, uiSettings }) =>
        authActions.loginComplete(user, uiSettings),
      )
      .catch(() => {
        authActions.toggleAuthInProgress(false);
      })
      .then(() => {
        this.setState({ isCheckingAuth: false });
      });
  }

  componentWillUnmount(): void {}

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any,
  ) {
    if (this.props.auth.user !== prevProps.auth.user) {
      if (this.props.auth.user) {
        // this.wsHelper.ws.connect();
      } else {
        // this.wsHelper.ws.disconnect();
      }
    }
  }

  renderLoader() {
    return (
      <section className="hero is-white is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="large-loader-wrapper is-active">
              <div className="loader is-loading" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  render() {
    const { isCheckingAuth } = this.state;

    return (
      <>
        <div id="wrapper">
          <Navbar />
          {_SHOW_CURRENT_BREAKPOINT && (
            <div className="container">
              <small className="is-size-7 has-text-grey-lighter">
                <CurrentBreakpoint />
              </small>
            </div>
          )}
          {isCheckingAuth && this.renderLoader()}
          {!isCheckingAuth && this.props.children}
        </div>
        <Footer />
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RootView);
