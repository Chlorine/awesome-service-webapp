import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import { format, getDaysInMonth, parse, startOfDay } from 'date-fns';

import api from '../../back/server-api';

import { UserInfo } from '../../back/common/users';
import { Params as UserApiParams } from '../../back/common/users/api';
import { SimpleSpinner } from '../Common/SimpleSpinner';
import { UnmountHelper } from '../../utils/unmount-helper';

import {
  FieldValidationStatus,
  SubmitButton,
  TextInputField,
} from '../Common/Forms';

import { Alert } from '../Common/Alert';

import './Personal.scss';
import { VEPageSecondaryTitle } from '../Common/ViewElements';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
  submitErrorMsg: string;
  userInfo?: UserInfo;
  submitOkMsgVisible: boolean;
  somethingChanged: boolean;
};

declare type BirthdayValues = {
  bdDay: number;
  bdMonth: number;
  bdYear: number;
};

declare type FormValues = {
  firstName: string;
  middleName?: string;
  lastName: string;
  withBirthday?: boolean;
  gender?: 'male' | 'female';
} & BirthdayValues;

const _BD_YEAR = {
  max: new Date().getFullYear(),
  min: new Date().getFullYear() - 150,
};

export default class Personal extends React.Component<Props, State> {
  uh = new UnmountHelper();
  bdDayRef = React.createRef<HTMLInputElement>();

  state: State = {
    isFetching: true,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    submitOkMsgVisible: false,
    somethingChanged: false,
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
    withBirthday: yup.boolean(),
    bdDay: yup
      .number()
      .required()
      .min(1)
      .test('is-correct-day-of-month', 'Некорректный день месяца', function(
        day,
      ) {
        if (!this.resolve(yup.ref('withBirthday'))) {
          return true;
        }

        let maxDayNr = 31;

        const year = this.resolve(yup.ref('bdYear'));
        if (year && 4 === String(year).length) {
          const month = this.resolve(yup.ref('bdMonth'));
          maxDayNr = getDaysInMonth(new Date(year, month));
        }

        return day <= maxDayNr;
      }),
    bdMonth: yup.number().required(),
    bdYear: yup
      .number()
      .required()
      .max(_BD_YEAR.max)
      .min(_BD_YEAR.min),
    gender: yup
      .mixed()
      .optional()
      .oneOf(['male', 'female']),
  });

  componentDidMount(): void {
    this.uh.onMount();
    document.title = 'Мои данные';

    this.setState({ isFetching: true, fetchErrorMsg: '' });

    this.uh
      .wrap(api.users.exec('getProfile', { __delay: 0, __genErr: false }))
      .then(({ err, results }) => {
        this.setState({ isFetching: false });

        if (err) {
          this.setState({ fetchErrorMsg: err.message });
        } else {
          const { userInfo } = results;
          this.setState({ userInfo });
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { firstName, middleName, lastName, withBirthday, gender } = values;

    this.setState({
      submitErrorMsg: '',
      submitOkMsgVisible: false,
    });

    const params: UserApiParams<'updateProfile'> = {
      firstName,
      middleName,
      lastName,
      gender,
    };

    if (withBirthday) {
      const { bdDay, bdMonth, bdYear } = values;
      params.birthday = format(new Date(bdYear, bdMonth, bdDay), 'yyyy-MM-dd');
    } else {
      params.birthday = null;
    }

    this.uh
      .wrap(
        api.users.exec('updateProfile', {
          ...params,
          __delay: 100,
          __genErr: false,
        }),
      )
      .then(({ err, results }) => {
        actions.setSubmitting(false);

        if (err) {
          this.setState({ submitErrorMsg: err.message });
        } else {
          const { userInfo } = results;

          this.setState({
            userInfo,
            submitOkMsgVisible: true,
            somethingChanged: false,
          });

          this.uh.setTimeout(
            () => this.setState({ submitOkMsgVisible: false }),
            2000,
          );
        }
      });
  };

  onFormValueChange = () => {
    this.setState({
      somethingChanged: true,
      submitOkMsgVisible: false,
    });
  };

  get userBirthday(): BirthdayValues {
    const { userInfo } = this.state;

    if (userInfo && userInfo.birthday) {
      try {
        const bd = parse(
          userInfo.birthday,
          'yyyy-MM-dd',
          startOfDay(new Date()),
        );

        return {
          bdDay: bd.getDate(),
          bdMonth: bd.getMonth(),
          bdYear: bd.getFullYear(),
        };
      } catch (err) {
        // oops
      }
    }

    return {
      bdDay: 1,
      bdMonth: 0,
      bdYear: 1970,
    };
  }

  renderForm = (fp: FormikProps<FormValues>) => {
    const {
      handleSubmit,
      isSubmitting,
      values,
      handleBlur,
      handleChange,
      setFieldValue,
    } = fp;
    const { submitErrorMsg, submitOkMsgVisible, somethingChanged } = this.state;
    const { withBirthday } = values;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Имя ----------------------------------------*/}

        <TextInputField
          label="Имя"
          placeholder="Иван"
          fp={fp}
          name={'firstName'}
          maxLength={65}
          onChange={this.onFormValueChange}
        />

        {/* --- Отчество ----------------------------------------*/}

        <TextInputField
          label="Отчество"
          placeholder="Иванович"
          fp={fp}
          name={'middleName'}
          maxLength={65}
          onChange={this.onFormValueChange}
        />

        {/* --- Фамилия ----------------------------------------*/}

        <TextInputField
          label="Фамилия"
          placeholder="Иванов"
          fp={fp}
          name={'lastName'}
          maxLength={65}
          onChange={this.onFormValueChange}
        />

        {/* --- День рождения ---------------------------------*/}

        {!withBirthday && (
          <div className="field">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              className="has-text-link"
              onClick={() => {
                setFieldValue('withBirthday', true);
                this.onFormValueChange();
                setTimeout(
                  () => this.bdDayRef.current && this.bdDayRef.current.focus(),
                  22,
                );
              }}
            >
              Указать день рождения
            </a>
          </div>
        )}

        {withBirthday && (
          <>
            <div className="columns is-gapless is-mobile bd-header-columns">
              <div className="column label">День рождения</div>
              <div className="column has-text-right">
                <button
                  type="button"
                  className="delete has-background-warning"
                  onClick={() => {
                    setFieldValue('withBirthday', false);
                    const defaultBD = this.userBirthday;
                    setFieldValue('bdDay', defaultBD.bdDay);
                    setFieldValue('bdMonth', defaultBD.bdMonth);
                    setFieldValue('bdYear', defaultBD.bdYear);
                    this.onFormValueChange();
                  }}
                />
              </div>
            </div>
            <div className="field">
              <div className="columns is-mobile bd-columns">
                <div className="column is-3">
                  <div className="control">
                    <input
                      ref={this.bdDayRef}
                      type="text"
                      inputMode="numeric"
                      name="bdDay"
                      placeholder="День"
                      className="input"
                      maxLength={2}
                      onBlur={handleBlur}
                      onChange={e => {
                        handleChange(e);
                        this.onFormValueChange();
                      }}
                      value={values.bdDay}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="column is-5">
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        disabled={isSubmitting}
                        name="bdMonth"
                        value={values.bdMonth}
                        onChange={e => {
                          handleChange(e);
                          this.onFormValueChange();
                        }}
                        onBlur={handleBlur}
                      >
                        <option value="0">января</option>
                        <option value="1">февраля</option>
                        <option value="2">марта</option>
                        <option value="3">апреля</option>
                        <option value="4">мая</option>
                        <option value="5">июня</option>
                        <option value="6">июля</option>
                        <option value="7">августа</option>
                        <option value="8">сентября</option>
                        <option value="9">октября</option>
                        <option value="10">ноября</option>
                        <option value="11">декабря</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="column is-4">
                  <div className="control">
                    <input
                      type="text"
                      inputMode="numeric"
                      name="bdYear"
                      placeholder="Год"
                      className="input"
                      maxLength={4}
                      onBlur={handleBlur}
                      onChange={e => {
                        handleChange(e);
                        this.onFormValueChange();
                      }}
                      value={values.bdYear}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
              <div className="container">
                <FieldValidationStatus
                  fp={fp}
                  name={'bdDay'}
                  title="День"
                  clsNames="bd-validation-status"
                />
                <FieldValidationStatus
                  fp={fp}
                  name={'bdYear'}
                  title="Год"
                  clsNames="bd-validation-status"
                />
              </div>
            </div>
          </>
        )}

        {/* --- Пол ------------------ */}

        <div className="field">
          <label className="label">Пол</label>
          <div className="control">
            <label className="radio">
              <input
                type="radio"
                name="gender"
                checked={!values.gender}
                disabled={isSubmitting}
                onChange={() => {
                  setFieldValue('gender', undefined);
                  this.onFormValueChange();
                }}
              />{' '}
              Не указан
            </label>
            <label className="radio">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={values.gender === 'male'}
                disabled={isSubmitting}
                onChange={() => {
                  setFieldValue('gender', 'male');
                  this.onFormValueChange();
                }}
              />{' '}
              Мужской
            </label>
            <label className="radio">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={values.gender === 'female'}
                disabled={isSubmitting}
                onChange={() => {
                  setFieldValue('gender', 'female');
                  this.onFormValueChange();
                }}
              />{' '}
              Женский
            </label>
          </div>
        </div>

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
              type={'success'}
              onClose={() => this.setState({ submitOkMsgVisible: false })}
            >
              Изменения сохранены
            </Alert>
          </div>
        )}

        {/*<div className="field">*/}
        {/*  <pre className="is-size-7">{JSON.stringify(values, null, 2)}</pre>*/}
        {/*</div>*/}

        {/* --- Сабмит ----------------------------------------*/}

        {somethingChanged && !submitOkMsgVisible && (
          <div className="field is-grouped">
            <p className="control">
              <SubmitButton
                text="Сохранить изменения"
                isSubmitting={isSubmitting}
              />
            </p>
            <p className="control">
              <button
                type="button"
                className="button submit-button"
                disabled={isSubmitting}
                onClick={() => {
                  fp.resetForm();
                  this.setState({
                    somethingChanged: false,
                    submitErrorMsg: '',
                  });
                }}
              >
                Отменить
              </button>
            </p>
          </div>
        )}
      </form>
    );
  };

  get formInitialValues(): FormValues {
    let values: FormValues = {
      firstName: '',
      middleName: '',
      lastName: '',
      bdDay: 1,
      bdMonth: 0,
      bdYear: 1970,
      withBirthday: false,
      gender: undefined,
    };

    const { userInfo } = this.state;

    if (userInfo) {
      const { firstName, middleName, lastName, birthday, gender } = userInfo;

      values.firstName = firstName;
      values.middleName = middleName;
      values.lastName = lastName;
      values.gender = gender || undefined;

      values = { ...values, ...this.userBirthday, withBirthday: !!birthday };
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
              <div className="column is-10-tablet is-7-desktop is-6-widescreen is-5-fullhd">
                <div className="box">
                  <VEPageSecondaryTitle title="Данные пользователя" />
                  <Formik
                    initialValues={this.formInitialValues}
                    enableReinitialize={true}
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
