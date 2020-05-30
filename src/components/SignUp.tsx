import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as yup from 'yup';
import { Redirect } from 'react-router';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { AppState } from '../store/state';

import api from './../back/server-api';

import { PositiveResults } from './Common/PositiveResults';
import { PasswordStrengthMeter } from './Common/PasswordStrengthMeter';

import { Actions as AuthActions } from '../actions/auth';

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

declare type FormValues = {
  lastName: string;
  firstName: string;
  middleName?: string;

  username: string;
  password: string;
  // passwordConfirm: string;
  // passwordStrength: number;

  acceptLegalStuff?: boolean;
};

declare type State = {
  email: string;
  errorMsg: string;
  pswVisible: boolean;
};

class SignUp extends React.Component<Props, State> {
  state: State = {
    email: '',
    errorMsg: '',
    pswVisible: false,
  };

  schema = yup.object().shape<FormValues>({
    lastName: yup
      .string()
      .required()
      .max(64)
      .trim(),
    firstName: yup
      .string()
      .required()
      .max(64)
      .trim(),
    middleName: yup
      .string()
      .max(64)
      .trim(),
    username: yup
      .string()
      .required()
      .email()
      .max(320)
      .trim(),
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

    // passwordStrength: yup
    //   .number()
    //   .required()
    //   .moreThan(
    //     1,
    //     'Ненадёжный пароль (используйте разный регистр, добавьте цифры или спецсимволы)',
    //   ),

    acceptLegalStuff: yup.boolean().oneOf([true], 'Нужно соглашаться!'),
  });

  componentDidMount(): void {
    document.title = 'Регистрация';
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { lastName, firstName, middleName, username, password } = values;

    this.setState({ errorMsg: '' });

    let userId: string | undefined;

    this.props.authActions.toggleAuthInProgress(true);

    api.users
      .exec('createUser', {
        lastName,
        firstName,
        middleName: middleName || '',
        email: username,
        password,
        __delay: 100,
      })
      .then(({ user, uiSettings }) => {
        userId = user.id;
        this.props.authActions.loginComplete(user, uiSettings);
      })
      .catch(err => {
        this.props.authActions.toggleAuthInProgress(false);
        this.setState({ errorMsg: err.message });
      })
      .then(() => {
        actions.setSubmitting(false);
        if (userId) {
          this.setState({ email: username });
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
    setFieldValue,
  }: FormikProps<FormValues>) => {
    const { errorMsg, pswVisible } = this.state;

    return (
      <form className="box" noValidate onSubmit={handleSubmit}>
        {/* --- Имя ---------------------------------------------- */}

        <div className="field">
          <label htmlFor="" className="label">
            Имя
          </label>
          <div className="control">
            <input
              type="text"
              name="firstName"
              placeholder="Иван"
              className="input"
              maxLength={65}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.firstName}
              disabled={isSubmitting}
            />
          </div>
          {touched.firstName && errors.firstName && (
            <p className="help is-danger">{errors.firstName}</p>
          )}
        </div>

        {/* --- Отчество ------------------------------ */}

        <div className="field">
          <label htmlFor="" className="label">
            Отчество
          </label>
          <div className="control">
            <input
              type="text"
              name="middleName"
              placeholder="Иванович"
              className="input"
              maxLength={65}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.middleName}
              disabled={isSubmitting}
            />
          </div>
          {touched.middleName && errors.middleName && (
            <p className="help is-danger">{errors.middleName}</p>
          )}
        </div>

        {/* --- Фамилия ----------------------------------- */}

        <div className="field">
          <label htmlFor="" className="label">
            Фамилия
          </label>
          <div className="control">
            <input
              type="text"
              name="lastName"
              placeholder="Иванов"
              className="input"
              maxLength={65}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.lastName}
              disabled={isSubmitting}
            />
          </div>
          {touched.lastName && errors.lastName && (
            <p className="help is-danger">{errors.lastName}</p>
          )}
        </div>

        {/* --- Почта ------------------------------- */}

        <div className="field">
          <label htmlFor="" className="label">
            Email
          </label>
          <div className="control">
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
          </div>
          {touched.username && errors.username && (
            <p className="help is-danger">{errors.username}</p>
          )}
        </div>

        {/* --- Пароль ------------------------------- */}

        <label htmlFor="" className="label">
          Пароль
        </label>
        <div className="field has-addons">
          <div className="control is-expanded">
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
            />
            {touched.password && errors.password && (
              <p className="help is-danger">{errors.password}</p>
            )}
          </div>
          <div className="control">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              href={'#'}
              className="button is-outlined"
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

        {/* --- ПАРОЛЬ ЕЩЕ РАЗ ------------------------------- */}
        {/*<div className="field">*/}
        {/*  <label htmlFor="" className="label">*/}
        {/*    Пароль еще раз*/}
        {/*  </label>*/}
        {/*  <div className="control">*/}
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
        {/*    />*/}
        {/*    {touched.passwordConfirm && errors.passwordConfirm && (*/}
        {/*      <p className="help is-danger">{errors.passwordConfirm}</p>*/}
        {/*    )}*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="field">
          <br />
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                name="acceptLegalStuff"
                onBlur={handleBlur}
                onChange={handleChange}
                checked={values.acceptLegalStuff}
                disabled={isSubmitting}
              />{' '}
              Я согласен предоставить немножко персональных данных этому
              динамично развивающемуся проекту
            </label>
            {touched.acceptLegalStuff && errors.acceptLegalStuff && (
              <p className="help is-danger">{errors.acceptLegalStuff}</p>
            )}
          </div>
        </div>

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
            Зарегистрироваться
          </button>
        </div>
      </form>
    );
  };

  renderSignUpForm() {
    const initialValues: FormValues = {
      lastName: '',
      firstName: '',
      middleName: '',
      username: '',
      password: '',
      // passwordConfirm: '',
      acceptLegalStuff: false,
      // passwordStrength: 0,
    };

    return (
      <div className="column is-6-tablet is-5-desktop is-4-widescreen">
        {/* --- Титле --- */}
        <h3 className="title has-text-grey">Регистрация</h3>
        {/* -- Форма регистрялова -------------*/}
        <Formik
          initialValues={initialValues}
          validationSchema={this.schema}
          onSubmit={this.onSubmit}
        >
          {this.renderForm}
        </Formik>
        {/* -- Ссылки на регистрацию и восстановлялово пароля ------*/}

        <p className="has-text-grey">
          <Link to="/login">Уже есть учетная запись</Link>
        </p>
      </div>
    );
  }

  renderSignupFinished() {
    return (
      <div className="column is-7-tablet is-6-desktop is-4-widescreen">
        {/* --- Титле --- */}
        <h3 className="title has-text-grey">Готово!</h3>
        {/* -- Сообщение о необходимости раскликать письмо ---------*/}
        <div className="box">
          <PositiveResults>
            <div className="content">
              <p>
                <strong>
                  Письмо со ссылкой для подтверждения email отправлено на адрес{' '}
                  <span className="has-text-grey">{this.state.email}</span>
                </strong>
              </p>
              <p>
                Если письмо не пришло в течение нескольких минут, проверьте
                папку "Спам"
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
    const { email } = this.state;

    return (
      <section className="hero is-white is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered">
              {!!email ? this.renderSignupFinished() : this.renderSignUpForm()}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
