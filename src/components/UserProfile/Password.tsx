import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';

import api from '../../back/server-api';

import { PasswordInputField, SubmitButton } from '../Common/Forms';
import { Alert } from '../Common/Alert';

declare type Props = {};

declare type State = {
  submitErrorMsg: string;
  submitOkMsgVisible: boolean;
};

declare type FormValues = {
  oldPassword: string;
  newPassword: string;
};

export default class Password extends React.Component<Props, State> {
  state: State = {
    submitErrorMsg: '',
    submitOkMsgVisible: false,
  };

  schema = yup.object().shape<FormValues>({
    oldPassword: yup
      .string()
      .required()
      .min(8)
      .max(100)
      .trim(),
    newPassword: yup
      .string()
      .required()
      .min(8)
      .max(100)
      .trim(),
  });

  componentDidMount(): void {
    document.title = 'Пароль';
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { oldPassword, newPassword } = values;

    this.setState({
      submitErrorMsg: '',
      submitOkMsgVisible: false,
    });

    api.users
      .exec('changePassword', {
        oldPassword,
        newPassword,
        __delay: 200,
        __genErr: false,
      })
      .then(() => {
        actions.resetForm({});
        this.setState({
          submitOkMsgVisible: true,
        });
      })
      .catch(err => this.setState({ submitErrorMsg: err.message }))
      .then(() => actions.setSubmitting(false));
  };

  renderForm = (fp: FormikProps<FormValues>) => {
    const { handleSubmit, isSubmitting } = fp;
    const { submitErrorMsg, submitOkMsgVisible } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Старый пароль ------------------------------- */}

        <PasswordInputField
          label="Текущий пароль"
          fp={fp}
          name={'oldPassword'}
          leftIcon="fa-lock"
          enableEyeButton={true}
          enableStrengthMeter={false}
          maxLength={101}
        />

        {/* --- Новый пароль ------------------------------- */}

        <PasswordInputField
          label="Новый пароль"
          fp={fp}
          name={'newPassword'}
          leftIcon="fa-lock"
          enableEyeButton={true}
          enableStrengthMeter={true}
          strengthMeterCaption="Надёжность нового пароля"
          maxLength={101}
        />

        {/* --- Ошибка сохранения ----------------------------------------*/}

        {submitErrorMsg && (
          <div className="field">
            <Alert
              type={'danger'}
              onClose={() => this.setState({ submitErrorMsg: '' })}
            >
              {submitErrorMsg}
            </Alert>
          </div>
        )}

        {/* --- Уведомление об успешном сохранении -----------------------*/}

        {submitOkMsgVisible && (
          <div className="field">
            <Alert
              type="success"
              onClose={() => this.setState({ submitOkMsgVisible: false })}
            >
              Пароль изменен
            </Alert>
          </div>
        )}

        {/* --- Сабмит ----------------------------------------*/}

        <div className="field">
          <SubmitButton text="Изменить пароль" isSubmitting={isSubmitting} />
        </div>
      </form>
    );
  };

  get formInitialValues(): FormValues {
    return {
      oldPassword: '',
      newPassword: '',
    };
  }

  render() {
    return (
      <div className="container">
        <div className="columns">
          <div className="column is-8-tablet is-6-desktop is-5-widescreen is-4-fullhd">
            <div className="box">
              <Formik
                initialValues={this.formInitialValues}
                validationSchema={this.schema}
                onSubmit={this.onSubmit}
              >
                {this.renderForm}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
