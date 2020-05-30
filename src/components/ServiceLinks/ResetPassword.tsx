import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as yup from 'yup';
import classNames from 'classnames';
import { Link, RouteComponentProps } from 'react-router-dom';

import { AppState } from '../../store/state';

import api from './../../back/server-api';

import { PositiveResults } from '../Common/PositiveResults';
import { Actions as AuthActions } from '../../actions/auth';
import { PasswordStrengthMeter } from '../Common/PasswordStrengthMeter';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Redirect } from 'react-router';

const mapStateToProps = (state: AppState) => {
  return {
    router: state.router,
    auth: state.auth,
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

declare type FormValues = {
  password: string;
  // passwordConfirm: string;
};

declare type State = {
  resetFinished: boolean;
  errorMsg: string;
  pswVisible: boolean;
  wasLoggedIn?: boolean;
};

class ResetPassword extends React.Component<Props, State> {
  state: State = {
    resetFinished: false,
    errorMsg: '',
    pswVisible: false,
  };

  schema = yup.object().shape<FormValues>({
    password: yup
      .string()
      .required()
      .min(8)
      .max(100)
      .trim(),
    // passwordConfirm: yup
    //   .string()
    //   .required()
    //   .min(8)
    //   .max(100)
    //   .trim()
    //   .oneOf([yup.ref('password')], 'Пароли должны совпадать'),
  });

  componentDidMount(): void {
    document.title = 'Завершение сброса пароля';

    this.setState({ wasLoggedIn: !!this.props.auth.user });
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { password } = values;

    this.setState({ errorMsg: '' });
    let accepted = false;

    this.props.authActions.toggleAuthInProgress(true);

    api.users
      .exec('resetPassword', {
        token: this.props.match.params.token || '',
        password,
        __delay: 500,
      })
      .then(({ user, uiSettings }) => {
        this.props.authActions.loginComplete(user, uiSettings);
        accepted = true;
      })
      .catch(err => {
        this.props.authActions.toggleAuthInProgress(false);
        this.setState({ errorMsg: err.message });
      })
      .then(() => {
        actions.setSubmitting(false);
        if (accepted) {
          this.setState({ resetFinished: true });
        }
      });
  };

  renderForm = ({
    handleSubmit,
    handleBlur,
    handleChange,
    values,
    touched,
    errors,
    isSubmitting,
  }: FormikProps<FormValues>) => {
    const { errorMsg, pswVisible } = this.state;

    return (
      <form
        className="box"
        noValidate
        autoComplete={'off'}
        onSubmit={handleSubmit}
      >
        {/* --- Пароль 1 ------------------------------- */}

        <label htmlFor="" className="label">
          Придумайте новый пароль
        </label>
        <div className="field has-addons">
          <div className="control has-icons-left is-expanded">
            <input
              type={pswVisible ? 'text' : 'password'}
              name="password"
              placeholder={pswVisible ? 'Звездочки' : '*******'}
              className="input"
              maxLength={101}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              disabled={isSubmitting}
              autoComplete={'new-password'}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-lock" />
            </span>

            {touched.password && errors.password && (
              <p className="help is-danger">{errors.password}</p>
            )}
          </div>
          <div className="control">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              className="button is-outlined"
              href="#"
              onClick={() => this.setState({ pswVisible: !pswVisible })}
            >
              <span className="icon is-small">
                <i
                  className={classNames('fa', {
                    'fa-eye': !pswVisible,
                    'fa-eye-slash': pswVisible,
                  })}
                />
              </span>
            </a>
          </div>
        </div>

        {/* --- Мощь пароля ------------------------------- */}

        {values.password && (
          <div className="field">
            <PasswordStrengthMeter password={values.password} />
          </div>
        )}

        {/* --- Пароль 2 ------------------------------- */}

        {/*<div className="field">*/}
        {/*  <label htmlFor="" className="label">*/}
        {/*    Новый пароль еще раз*/}
        {/*  </label>*/}
        {/*  <div className="control has-icons-left">*/}
        {/*    <input*/}
        {/*      type="password"*/}
        {/*      name="passwordConfirm"*/}
        {/*      placeholder="*******"*/}
        {/*      className="input"*/}
        {/*      maxLength={101}*/}
        {/*      onBlur={handleBlur}*/}
        {/*      onChange={handleChange}*/}
        {/*      value={values.passwordConfirm}*/}
        {/*      disabled={isSubmitting}*/}
        {/*      autoComplete={'new-password'}*/}
        {/*    />*/}
        {/*    <span className="icon is-small is-left">*/}
        {/*      <i className="fa fa-lock" />*/}
        {/*    </span>*/}
        {/*    {touched.passwordConfirm && errors.passwordConfirm && (*/}
        {/*      <p className="help is-danger">{errors.passwordConfirm}</p>*/}
        {/*    )}*/}
        {/*  </div>*/}
        {/*</div>*/}

        {/* --- Сообщение об ошибке -------------- */}

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

        {/* --- Submit -------------- */}

        <div className="field">
          <button
            type="submit"
            className={classNames('button is-primary', {
              'is-loading': isSubmitting,
            })}
            disabled={isSubmitting}
          >
            Сохранить
          </button>
        </div>
      </form>
    );
  };

  renderResetPasswordForm() {
    const initialValues: FormValues = {
      password: '',
      // passwordConfirm: '',
    };

    return (
      <div className="column is-6-tablet is-5-desktop is-4-widescreen">
        {/* --- Титле --- */}
        <h3 className="title has-text-grey">Завершение сброса пароля</h3>
        {/* -- Форма ввода пароля (двух?) -------------*/}
        <Formik
          initialValues={initialValues}
          validationSchema={this.schema}
          onSubmit={this.onSubmit}
        >
          {this.renderForm}
        </Formik>
      </div>
    );
  }

  renderResetFinished() {
    const { wasLoggedIn } = this.state;

    return (
      <div className="column is-7-tablet is-6-desktop is-4-widescreen">
        {/* -- Сообщение о том что пароль изменен ---------*/}
        <div className="box">
          <PositiveResults>
            <div className="content">
              <p>
                <strong>Пароль изменен</strong>
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
                <Link className="level-item" aria-label="home" to="/">
                  На главную
                </Link>
              </div>
            </nav>
          </PositiveResults>
        </div>
      </div>
    );
  }

  render() {
    const { resetFinished } = this.state;

    // if (this.props.auth.user) {
    //   return <Redirect to={'/overview'} />;
    // }

    return (
      <section className="hero is-white is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered">
              {resetFinished
                ? this.renderResetFinished()
                : this.renderResetPasswordForm()}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
