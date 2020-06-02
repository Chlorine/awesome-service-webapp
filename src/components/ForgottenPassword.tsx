import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as yup from 'yup';

import { AppState } from '../store/state';
import api from './../back/server-api';

import { PositiveResults } from './Common/PositiveResults';
import { SubmitButton, TextInputField } from './Common/Forms';
import { Alert } from './Common/Alert';

const mapStateToProps = (state: AppState) => {
  return {
    router: state.router,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

declare type State = {
  email: string;
  errorMsg: string;
};

declare type FormValues = {
  email: string;
};

class ForgottenPassword extends React.Component<Props, State> {
  state: State = {
    email: '',
    errorMsg: '',
  };

  schema = yup.object().shape<FormValues>({
    email: yup
      .string()
      .trim()
      .email()
      .max(320)
      .required(),
  });

  componentDidMount(): void {
    document.title = 'Сброс пароля';
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { email } = values;
    this.setState({ errorMsg: '' });
    let accepted = false;

    api.users
      .exec('requestPasswordReset', { email })
      .then(() => (accepted = true))
      .catch(err => {
        // accepted = true;
        this.setState({ errorMsg: err.message });
      })
      .then(() => {
        actions.setSubmitting(false);
        if (accepted) {
          this.setState({ email });
        }
      });
  };

  renderForm = (fp: FormikProps<FormValues>) => {
    const { handleSubmit, isSubmitting } = fp;

    const { errorMsg } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <p>Введите email, указанный вами при регистрации:</p>
        </div>
        <TextInputField
          type={'email'}
          label=""
          placeholder={'abc@example.com'}
          fp={fp}
          name={'email'}
          maxLength={321}
          leftIcon={'fa-envelope'}
        />
        {/* -- Ошибка сабмита ------------------*/}
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
        <div className="field">
          <SubmitButton
            text="Сбросить текущий пароль"
            isSubmitting={isSubmitting}
          />
        </div>
      </form>
    );
  };

  render() {
    const { email } = this.state;

    const initialValues: FormValues = {
      email: '',
    };

    return (
      <section className="hero is-white is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-6-tablet is-5-desktop">
                {/* -- Титле ----------------------------*/}
                {!email && (
                  <h3 className="title has-text-grey">Сброс пароля</h3>
                )}
                {/* --- Бокс ------------ */}
                <div className="box">
                  {/* -- Форма ввода емейла --------------------*/}
                  {!email && (
                    <Formik
                      initialValues={initialValues}
                      validationSchema={this.schema}
                      onSubmit={this.onSubmit}
                    >
                      {this.renderForm}
                    </Formik>
                  )}
                  {/* --- Сообщение о результатах запроса -------- */}
                  {!!email && (
                    <PositiveResults>
                      <div className="content">
                        <p>
                          <strong>
                            Письмо со ссылкой для сброса пароля отправлено на
                            адрес{' '}
                            <span className="has-text-grey">
                              {this.state.email}
                            </span>
                          </strong>
                        </p>
                        <p>
                          Если письмо не пришло в течение нескольких минут,
                          проверьте папку "Спам"
                        </p>
                      </div>
                    </PositiveResults>
                  )}
                </div>
                {/* -- Ссылки на регистрацию и логин ------*/}
                {!email && (
                  <p className="has-text-grey">
                    <Link to="/signup">Регистрация</Link> &nbsp;·&nbsp;{' '}
                    <Link to="/login">Вход</Link>
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

export default connect(mapStateToProps, mapDispatchToProps)(ForgottenPassword);
