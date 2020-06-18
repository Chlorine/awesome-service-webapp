import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Actions as AuthActions } from '../actions/auth';

import api from '../back/server-api';
import { RootState } from '../store';

const mapStateToProps = (state: RootState) => {
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
  ReturnType<typeof mapDispatchToProps>;

declare type State = {
  isWorking: boolean;
};

class Logout extends React.Component<Props, State> {
  state: State = {
    isWorking: true,
  };

  componentDidMount(): void {
    document.title = 'Выход из системы';

    api
      .logout()
      .catch(console.error)
      .then(() => {
        this.props.authActions.logoutComplete();
      });
  }

  render() {
    const { isWorking } = this.state;

    return (
      <section className="hero is-white is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container">
            {isWorking && (
              <div className="large-loader-wrapper is-active">
                <div className="loader is-loading" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
