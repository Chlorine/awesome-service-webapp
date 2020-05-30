import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { LocationDescriptorObject } from 'history';
import * as yup from 'yup';
import classNames from 'classnames';

import { Actions as AuthActions } from '../actions/auth';
import { AppState } from '../store/state';
import api from './../back/server-api';
import { LoginResponse } from '../back/common/users';
import { SimpleSpinner } from './Common/SimpleSpinner';

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
  isCheckingAuth: boolean;
  errorMsg: string;
};

declare type FormValues = {
  username: string;
  password: string;
};

class Login extends React.Component<Props, State> {
  state: State = {
    isCheckingAuth: true,
    errorMsg: '',
  };

  schema = yup.object().shape<FormValues>({
    username: yup
      .string()
      .trim()
      .email()
      .max(320)
      .required(),
    password: yup
      .string()
      .trim()
      .min(8)
      .max(100)
      .required(),
  });

  componentDidMount(): void {
    document.title = 'Вход в систему';

    this.setState({ isCheckingAuth: true });

    const { authActions } = this.props;

    authActions.toggleAuthInProgress(true);

    api
      .checkAuth({ __delay: 0 })
      .then(({ user, uiSettings }) => {
        authActions.loginComplete(user, uiSettings, this.pathToRedirect);
      })
      .catch(() => {
        authActions.toggleAuthInProgress(false);
        this.setState({ isCheckingAuth: false });
      });
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { username, password } = values;
    const { authActions } = this.props;

    this.setState({ errorMsg: '' });

    let loginResp: LoginResponse | undefined;

    authActions.toggleAuthInProgress(true);

    api
      .login(username, password)
      .then(resp => (loginResp = resp))
      .catch(err => {
        this.setState({ errorMsg: err.message });
      })
      .then(() => {
        actions.setSubmitting(false);

        if (loginResp) {
          const { user, uiSettings } = loginResp;
          authActions.loginComplete(user, uiSettings, this.pathToRedirect);
        } else {
          authActions.toggleAuthInProgress(false);
        }
      });
  };

  get pathToRedirect(): LocationDescriptorObject {
    const { state } = this.props.router.location;
    if (state && 'from' in state) {
      // @ts-ignore
      return state.from;
    }

    return { pathname: '/' };
  }

  renderForm = ({
    handleSubmit,
    handleBlur,
    handleChange,
    values,
    touched,
    errors,
    isSubmitting,
  }: FormikProps<FormValues>) => {
    const { errorMsg } = this.state;

    return (
      <form className="box" noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="" className="label">
            Email
          </label>
          <div className="control has-icons-left">
            <input
              type="email"
              name="username"
              placeholder="abc@example.com"
              className="input"
              maxLength={321}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.username}
              disabled={isSubmitting}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-envelope" />
            </span>
          </div>
          {touched.username && errors.username && (
            <p className="help is-danger">{errors.username}</p>
          )}
        </div>
        <div className="field">
          <label htmlFor="" className="label">
            Пароль
          </label>
          <div className="control has-icons-left">
            <input
              type="password"
              name="password"
              placeholder="*******"
              className="input"
              maxLength={101}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              disabled={isSubmitting}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-lock" />
            </span>
            {touched.password && errors.password && (
              <p className="help is-danger">{errors.password}</p>
            )}
          </div>
        </div>
        {/* -- Ошибка входа ------------------*/}
        {errorMsg && (
          <div className="field">
            <div className="notification is-danger is-light">
              <button
                className="delete"
                onClick={() => this.setState({ errorMsg: '' })}
              />
              {errorMsg}
            </div>
          </div>
        )}
        <div className="field">
          <button
            type="submit"
            className={classNames('button is-primary', {
              'is-loading': isSubmitting,
            })}
            disabled={isSubmitting}
          >
            Вход
          </button>
        </div>
      </form>
    );
  };

  render() {
    const { isCheckingAuth } = this.state;

    const initialValues: FormValues = {
      username: '',
      password: '',
    };

    return (
      <section className="hero is-white is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-5-tablet is-4-desktop">
                {/* -- Титле ----------------------------*/}
                <h3 className="title has-text-grey">Вход в систему</h3>
                {/* -- Крутилка ----------------------------*/}
                {isCheckingAuth && <SimpleSpinner />}
                {/* -- Форма логина -----------------------------------*/}
                {!isCheckingAuth && (
                  <Formik
                    initialValues={initialValues}
                    validationSchema={this.schema}
                    onSubmit={this.onSubmit}
                  >
                    {this.renderForm}
                  </Formik>
                )}
                {/* -- Ссылки на регистрацию и восстановлялово пароля ------*/}
                {!isCheckingAuth && (
                  <p className="has-text-grey">
                    <Link to="/signup">Регистрация</Link> &nbsp;·&nbsp;{' '}
                    <Link to="/forgotten-password">Забыли пароль?</Link>
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

export default connect(mapStateToProps, mapDispatchToProps)(Login);
