import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as yup from 'yup';
import { Link } from 'react-router-dom';

import api from './../back/server-api';

import { PositiveResults } from './Common/PositiveResults';

import { Actions as AuthActions } from '../actions/auth';

import {
  FieldValidationStatus,
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
  firstFieldRef = React.createRef<any>();

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

    this.firstFieldRef.current && this.firstFieldRef.current.focus();
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

  renderForm = (fp: FormikProps<FormValues>) => {
    const { handleSubmit, handleBlur, handleChange, values, isSubmitting } = fp;

    const { errorMsg } = this.state;

    return (
      <form className="box" noValidate onSubmit={handleSubmit}>
        {/* --- Имя ---------------------------------------------- */}

        <TextInputField
          label="Имя"
          placeholder="Иван"
          fp={fp}
          name={'firstName'}
          maxLength={65}
          innerRef={this.firstFieldRef}
        />

        {/* --- Отчество ------------------------------ */}

        <TextInputField
          label="Отчество"
          placeholder="Иванович"
          fp={fp}
          name={'middleName'}
          maxLength={65}
        />

        {/* --- Фамилия ----------------------------------- */}

        <TextInputField
          label="Фамилия"
          placeholder="Иванов"
          fp={fp}
          name={'lastName'}
          maxLength={65}
        />

        {/* --- Почта ------------------------------- */}

        <TextInputField
          type={'email'}
          label={'Email'}
          placeholder={'abc@example.com'}
          fp={fp}
          name={'username'}
          maxLength={321}
        />

        {/* --- Пароль ------------------------------- */}

        <PasswordInputField
          label={'Пароль'}
          fp={fp}
          name={'password'}
          maxLength={101}
          enableEyeButton={true}
          enableStrengthMeter={true}
        />

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
            <FieldValidationStatus fp={fp} name="acceptLegalStuff" />
          </div>
        </div>

        {/* --- Сообщение об ошибке -------------- */}

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

        {/* --- Submit -------------- */}

        <div className="field">
          <SubmitButton text="Зарегистрироваться" isSubmitting={isSubmitting} />
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
          <Link className="has-text-link" to="/login">
            Уже есть учетная запись
          </Link>
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
                <Link
                  className="level-item has-text-link"
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
