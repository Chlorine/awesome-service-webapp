import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import classNames from 'classnames';

import api from '../../back/server-api';

import { PasswordStrengthMeter } from '../Common/PasswordStrengthMeter';

declare type Props = {};

declare type State = {
  submitErrorMsg: string;
  submitOkMsgVisible: boolean;
  oldPasswordVisible: boolean;
  newPasswordVisible: boolean;
};

declare type FormValues = {
  oldPassword: string;

  newPassword: string;
};

export default class Password extends React.Component<Props, State> {
  state: State = {
    submitErrorMsg: '',
    submitOkMsgVisible: false,
    oldPasswordVisible: false,
    newPasswordVisible: false,
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
      .then(() =>
        this.setState({
          submitOkMsgVisible: true,
        }),
      )
      .catch(err => this.setState({ submitErrorMsg: err.message }))
      .then(() => actions.setSubmitting(false));
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
    const {
      submitErrorMsg,
      submitOkMsgVisible,
      oldPasswordVisible,
      newPasswordVisible,
    } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Старый пароль ------------------------------- */}

        <label htmlFor="" className="label">
          Текущий пароль
        </label>
        <div className="field has-addons">
          <div className="control is-expanded has-icons-left">
            <input
              type={oldPasswordVisible ? 'text' : 'password'}
              name="oldPassword"
              placeholder={oldPasswordVisible ? 'Звездочки' : '*******'}
              className="input"
              maxLength={101}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.oldPassword}
              disabled={isSubmitting}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-lock" />
            </span>
            {touched.oldPassword && errors.oldPassword && (
              <p className="help is-danger">{errors.oldPassword}</p>
            )}
          </div>
          <div className="control">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              href={'#'}
              className="button is-outlined"
              onClick={() =>
                this.setState({ oldPasswordVisible: !oldPasswordVisible })
              }
            >
              <span className="icon is-small">
                <i
                  className={classNames('fa', {
                    'fa-eye': !oldPasswordVisible,
                    'fa-eye-slash': oldPasswordVisible,
                  })}
                />
              </span>
            </a>
          </div>
        </div>

        {/* --- Новый пароль ------------------------------- */}

        <label htmlFor="" className="label">
          Новый пароль
        </label>
        <div className="field has-addons">
          <div className="control is-expanded has-icons-left">
            <input
              type={newPasswordVisible ? 'text' : 'password'}
              name="newPassword"
              placeholder={newPasswordVisible ? 'Звездочки' : '*******'}
              className="input"
              maxLength={101}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.newPassword}
              disabled={isSubmitting}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-lock" />
            </span>
            {touched.newPassword && errors.newPassword && (
              <p className="help is-danger">{errors.newPassword}</p>
            )}
          </div>
          <div className="control">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              href={'#'}
              className="button is-outlined"
              onClick={() =>
                this.setState({ newPasswordVisible: !newPasswordVisible })
              }
            >
              <span className="icon is-small">
                <i
                  className={classNames('fa', {
                    'fa-eye': !newPasswordVisible,
                    'fa-eye-slash': newPasswordVisible,
                  })}
                />
              </span>
            </a>
          </div>
        </div>

        {/* --- Мощь пароля ------------------------------- */}

        {values.newPassword && (
          <div className="field">
            <PasswordStrengthMeter
              password={values.newPassword}
              caption={'Надёжность нового пароля'}
            />
          </div>
        )}

        {/* --- Ошибка сохранения ----------------------------------------*/}

        {submitErrorMsg && (
          <div className="field">
            <div className="notification is-danger is-light">
              <button
                className="delete"
                onClick={() => this.setState({ submitErrorMsg: '' })}
              />
              {submitErrorMsg}
            </div>
          </div>
        )}

        {/* --- Уведомление об успешном сохранении -----------------------*/}

        {submitOkMsgVisible && (
          <div className="field">
            <div className="notification is-success is-light">
              <button
                className="delete"
                onClick={() => this.setState({ submitOkMsgVisible: false })}
              />
              Пароль изменен
            </div>
          </div>
        )}

        {/* --- Сабмит ----------------------------------------*/}

        <div className="field">
          <button
            type="submit"
            className={classNames('button is-primary', {
              'is-loading': isSubmitting,
            })}
            disabled={isSubmitting}
          >
            Изменить пароль
          </button>
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
