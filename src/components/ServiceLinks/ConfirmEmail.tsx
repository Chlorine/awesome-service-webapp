import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { AppState } from '../../store/state';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import api from '../../back/server-api';
import { PositiveResults } from '../Common/PositiveResults';
import { Actions as AuthActions } from '../../actions/auth';
import { Alert } from '../Common/Alert';

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
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<{ token?: string }>;

declare type State = {
  isWorking: boolean;
  errorMsg: string;
  wasLoggedIn?: boolean;
};

class ConfirmEmail extends React.Component<Props, State> {
  state: State = {
    isWorking: true,
    errorMsg: '',
  };

  componentDidMount(): void {
    document.title = 'Подтверждение email';

    this.setState({ isWorking: true, wasLoggedIn: !!this.props.auth.user });

    this.props.authActions.toggleAuthInProgress(true);

    api.users
      .exec('confirmEmail', {
        token: this.props.match.params.token || '',
        __delay: 100,
      })
      .then(({ user, uiSettings }) => {
        this.props.authActions.loginComplete(user, uiSettings);
      })
      .catch(err => {
        this.props.authActions.toggleAuthInProgress(false);
        this.setState({ errorMsg: err.message });
      })
      .then(() => this.setState({ isWorking: false }));
  }

  render() {
    const { isWorking, errorMsg, wasLoggedIn } = this.state;

    return (
      <section className="hero is-white is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container">
            {isWorking && !errorMsg && (
              <div className="large-loader-wrapper is-active">
                <div className="loader is-loading" />
              </div>
            )}
            {!isWorking && errorMsg && (
              <Alert type="danger">
                Ошибка подтверждения email: {errorMsg}
              </Alert>
            )}
            {!isWorking && !errorMsg && (
              <>
                <div className="columns is-centered">
                  <div className="column is-7-tablet is-6-desktop is-4-widescreen">
                    {/* --- Титле --- */}
                    <h3 className="title has-text-grey">Готово!</h3>
                    <div className="box">
                      <PositiveResults>
                        <div className="content">
                          <p>
                            <strong>Еmail подтвержден!</strong>
                            {!wasLoggedIn && (
                              <>
                                <br />
                                Выполнен вход.
                              </>
                            )}
                          </p>
                        </div>
                        <nav className="level is-mobile">
                          <div className="level-left">
                            <Link
                              className="level-item"
                              aria-label="home"
                              to="/"
                            >
                              На главную
                            </Link>
                          </div>
                        </nav>
                      </PositiveResults>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmEmail);
