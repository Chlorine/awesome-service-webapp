import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import classNames from 'classnames';

import api from '../../back/server-api';

import { UserInfo } from '../../back/common/users';
import { SimpleSpinner } from '../Common/SimpleSpinner';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
  submitErrorMsg: string;
  userInfo?: UserInfo;
  submitOkMsgVisible: boolean;
};

declare type FormValues = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export default class Personal extends React.Component<Props, State> {
  state: State = {
    isFetching: true,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    submitOkMsgVisible: false,
  };

  schema = yup.object().shape<FormValues>({
    firstName: yup
      .string()
      .required()
      .max(64)
      .trim(),
    middleName: yup
      .string()
      .max(64)
      .trim(),
    lastName: yup
      .string()
      .required()
      .max(64)
      .trim(),
  });

  componentDidMount(): void {
    document.title = 'Мои данные';

    this.setState({ isFetching: true });

    api.users
      .exec('getProfile', { __delay: 0, __genErr: false })
      .then(({ userInfo }) => this.setState({ userInfo }))
      .catch(err => this.setState({ fetchErrorMsg: err.message }))
      .then(() => this.setState({ isFetching: false }));
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { firstName, middleName, lastName } = values;

    this.setState({
      submitErrorMsg: '',
      submitOkMsgVisible: false,
    });

    api.users
      .exec('updateProfile', {
        firstName,
        middleName,
        lastName,
        __delay: 200,
        __genErr: false,
      })
      .then(({ userInfo }) =>
        this.setState({
          userInfo,
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
    const { submitErrorMsg, submitOkMsgVisible } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Имя ----------------------------------------*/}

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

        {/* --- Отчество ----------------------------------------*/}

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

        {/* --- Фамилия ----------------------------------------*/}

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
              Изменения сохранены
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
            Сохранить изменения
          </button>
        </div>
      </form>
    );
  };

  get formInitialValues(): FormValues {
    const values: FormValues = {
      firstName: '',
      middleName: '',
      lastName: '',
    };

    const { userInfo } = this.state;

    if (userInfo) {
      const { firstName, middleName, lastName } = userInfo;

      values.firstName = firstName;
      values.middleName = middleName;
      values.lastName = lastName;
    }

    return values;
  }

  render() {
    const { isFetching, fetchErrorMsg, userInfo } = this.state;

    return (
      <div className="container">
        {isFetching && (
          <div className="columns">
            <div className="column is-12">
              <SimpleSpinner text="Загрузка..." />
            </div>
          </div>
        )}
        {fetchErrorMsg && (
          <div className="columns">
            <div className="column is-12">
              <div className="notification is-danger is-light">
                Не удалось загрузить данные пользователя: {fetchErrorMsg}
              </div>
            </div>
          </div>
        )}
        {!isFetching && !fetchErrorMsg && userInfo && (
          <>
            {!userInfo.emailConfirmed && (
              <div className="notification is-warning is-light">
                Email не подтвержден
              </div>
            )}
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
          </>
        )}
      </div>
    );
  }
}
