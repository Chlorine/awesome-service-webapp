import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Actions as AuthActions } from '../actions/auth';
import { AppState } from '../store/state';

import api from '../back/server-api';

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
      <section className="hero is-white is-fullheight">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-6-tablet is-5-desktop is-4-widescreen">
                <h3 className="title has-text-grey1">Выход из системы</h3>
                {isWorking && (
                  <p className="has-text-grey">
                    <span className="icon">
                      <i className="fa fa-circle-o-notch fast-spin" />
                    </span>{' '}
                    Пожалуйста, подождите...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
