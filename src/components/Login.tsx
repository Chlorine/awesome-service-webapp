import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { LocationDescriptorObject } from 'history';
import * as yup from 'yup';

import { Actions as AuthActions } from '../actions/auth';
import api from './../back/server-api';
import { LoginResponse } from '../back/common/users';
import { SimpleSpinner } from './Common/SimpleSpinner';
import {
  PasswordInputField,
  SubmitButton,
  TextInputField,
} from './Common/Forms';
import { Alert } from './Common/Alert';
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

  pswRef = React.createRef<any>();

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
        this.pswRef && this.pswRef.current && this.pswRef.current.focus();
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

  renderForm = (fp: FormikProps<FormValues>) => {
    const { handleSubmit, isSubmitting } = fp;
    const { errorMsg } = this.state;

    return (
      <form className="box" noValidate onSubmit={handleSubmit}>
        {/* -- Логин (емейл) --------- */}
        <TextInputField
          type={'email'}
          label={'Email'}
          placeholder={'abc@example.com'}
          fp={fp}
          name={'username'}
          maxLength={321}
          leftIcon={'fa-envelope'}
          innerRef={this.pswRef}
        />
        {/* -- Пароль ------------------ */}
        <PasswordInputField
          label="Пароль"
          fp={fp}
          name="password"
          maxLength={101}
          leftIcon="fa-lock"
          enableEyeButton={true}
        />
        {/* -- Ошибка входа ------------------ */}
        {errorMsg && (
          <div className="field">
            <Alert
              type={'danger'}
              onClose={() => this.setState({ errorMsg: '' })}
            >
              {errorMsg}
            </Alert>
          </div>
        )}
        {/* -- Submit ------------------ */}
        <div className="field">
          <SubmitButton text="Вход" isSubmitting={isSubmitting} />
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
                    <Link className="has-text-link" to="/signup">
                      Регистрация
                    </Link>{' '}
                    &nbsp;·&nbsp;{' '}
                    <Link className="has-text-link" to="/forgotten-password">
                      Забыли пароль?
                    </Link>
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
