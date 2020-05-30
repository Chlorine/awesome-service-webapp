import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import classNames from 'classnames';
import { add, isBefore, parseISO, startOfDay } from 'date-fns';
import { isObject } from 'lodash';
import DatePicker from 'react-datepicker';

import api from '../../back/server-api';

import { UnmountHelper } from '../../utils/unmount-helper';
import { SimpleSpinner } from '../Common/SimpleSpinner';
import { SurveyInfo } from '../../back/common/public-events/survey';
import { history } from '../../store';
import { FormikPersist } from '../Common/FormikPersist';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
  submitErrorMsg: string;
  surveys: SurveyInfo[];
};

declare type FormValues = {
  name: string;
  description?: string;
  placeName: string;
  placeAddress: string;
  start: Date;
  end: Date;
  surveyId?: string;
};

export default class EventCreate extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: true,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    surveys: [],
  };

  schema = yup.object().shape<FormValues>({
    name: yup
      .string()
      .required()
      .max(255)
      .trim(),
    description: yup
      .string()
      .max(512)
      .trim(),
    placeName: yup
      .string()
      .required()
      .max(255)
      .trim(),
    placeAddress: yup
      .string()
      .required()
      .max(512)
      .trim(),
    start: yup
      .date()
      .required()
      .test(
        'not-too-early',
        'Дата начала не может быть раньше сегодняшнего дня',
        value => !isBefore(value, startOfDay(new Date())),
      ),
    end: yup
      .date()
      .required()
      .min(
        yup.ref('start'),
        'Дата окончания не должна быть раньше даты начала',
      ),
    surveyId: yup.string(),
  });

  componentDidMount(): void {
    document.title = 'Новое мероприятие';
    this.uh.onMount();

    this.setState({ isFetching: true, fetchErrorMsg: '' });

    this.uh
      .wrap(api.events.exec('getSurveys', { __delay: 1, __genErr: false }))
      .then(({ stillMounted, err, results }) => {
        if (stillMounted) {
          if (err) {
            this.setState({ fetchErrorMsg: err.message });
          } else {
            const { surveys } = results;
            this.setState({ surveys });
          }

          this.setState({ isFetching: false });
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { setSubmitting, resetForm } = actions;

    const {
      name,
      description,
      placeName,
      placeAddress,
      start,
      end,
      surveyId,
    } = values;

    this.setState({
      submitErrorMsg: '',
    });

    this.uh
      .wrap(
        api.events.exec('createEvent', {
          name,
          description: description || '',
          place: {
            name: placeName,
            address: placeAddress,
            location: undefined, // TODO: +map
          },
          start: start.toISOString(),
          end: end.toISOString(),
          surveyId: surveyId || undefined,
          // dbg:
          __delay: 500,
          __genErr: false,
        }),
      )
      .then(({ stillMounted, err, results }) => {
        if (stillMounted) {
          setSubmitting(false);

          if (err) {
            this.setState({ submitErrorMsg: err.message });
          } else {
            const { event } = results;

            resetForm({});
            history.push(`/public-event/${event.id}`);
          }
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
    const { submitErrorMsg, surveys } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Название ----------------------------------------*/}

        <div className="field">
          <label htmlFor="" className="label">
            Название
          </label>
          <div className="control">
            <input
              type="text"
              name="name"
              placeholder="Мероприятие"
              className="input"
              maxLength={256}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.name}
              disabled={isSubmitting}
            />
          </div>
          {touched.name && errors.name && (
            <p className="help is-danger">{errors.name}</p>
          )}
        </div>

        {/* --- Описание ----------------------------------------*/}

        <div className="field">
          <label htmlFor="" className="label">
            Описание
          </label>
          <div className="control">
            <textarea
              name="description"
              placeholder="Краткое описание мероприятия"
              className="textarea"
              maxLength={513}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.description}
              disabled={isSubmitting}
            />
          </div>
          {touched.description && errors.description && (
            <p className="help is-danger">{errors.description}</p>
          )}
        </div>

        {/* --- Название места проведения --------------*/}

        <div className="field">
          <label htmlFor="" className="label">
            Место проведения
          </label>
          <div className="control">
            <input
              type="text"
              name="placeName"
              placeholder="Место проведения"
              className="input"
              maxLength={256}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.placeName}
              disabled={isSubmitting}
            />
          </div>
          {touched.placeName && errors.placeName && (
            <p className="help is-danger">{errors.placeName}</p>
          )}
        </div>

        {/* --- Адрес места проведения --------------*/}

        <div className="field">
          <label htmlFor="" className="label">
            Адрес места проведения
          </label>
          <div className="control">
            <textarea
              name="placeAddress"
              placeholder="Место проведения"
              className="textarea"
              maxLength={513}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.placeAddress}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          {touched.placeAddress && errors.placeAddress && (
            <p className="help is-danger">{errors.placeAddress}</p>
          )}
        </div>

        {/* --- Даты начала и окончания ------------- */}

        <div className="field">
          <div className="columns">
            <div className="column is-6">
              {/* --- Дата начала --------------*/}

              <div className="field">
                <label htmlFor="" className="label">
                  Дата начала
                </label>
                <div className="control">
                  <DatePicker
                    name="start"
                    className="input"
                    selected={values.start}
                    minDate={new Date()}
                    // maxDate={values.end}
                    onChange={date => setFieldValue('start', date)}
                    placeholderText={'Начало'}
                    onBlur={handleBlur}
                    dateFormat={'dd.MM.yyyy'}
                    todayButton={'Сегодня'}
                  />
                </div>
                {touched.start && errors.start && (
                  <p className="help is-danger">{errors.start}</p>
                )}
              </div>
            </div>
            <div className="column is-6">
              {/* --- Дата окончания --------------*/}

              <div className="field">
                <label htmlFor="" className="label">
                  Дата окончания
                </label>
                <div className="control">
                  <DatePicker
                    name="end"
                    className="input"
                    selected={values.end}
                    minDate={values.start}
                    maxDate={undefined}
                    onChange={date => setFieldValue('end', date)}
                    placeholderText={'Окончание'}
                    onBlur={handleBlur}
                    dateFormat={'dd.MM.yyyy'}
                    todayButton={'Сегодня'}
                  />
                </div>
                {touched.end && errors.end && (
                  <p className="help is-danger">{errors.end}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Анкета ------------- */}

        <div className="field">
          <label htmlFor="" className="label">
            Анкета посетителя
          </label>
          <div className="control is-expanded">
            <div className="select is-fullwidth">
              <select
                name="surveyId"
                value={values.surveyId}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Без анкеты</option>
                {surveys.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {surveys.length === 0 && (
              <p className="help has-text-grey">Список доступных анкет пуст</p>
            )}
          </div>
        </div>

        {/* --- Ошибка создания ----------------------------------------*/}

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

        {/* --- Сабмит ----------------------------------------*/}

        <div className="field">
          <button
            type="submit"
            className={classNames('button is-primary', {
              'is-loading': isSubmitting,
            })}
            disabled={isSubmitting}
          >
            Создать мероприятие
          </button>
        </div>
        <FormikPersist
          formName={this.formName}
          onBeforeSave={this.onBeforeFormSave}
          onBeforeLoad={this.onBeforeFormLoad}
        />
      </form>
    );
  };

  get formName() {
    return 'event-create-form-v01';
  }

  onBeforeFormSave = (values: FormValues): FormValues => {
    return {
      ...values,
    };
  };

  onBeforeFormLoad = (maybeValues?: Partial<FormValues>): FormValues | null => {
    if (maybeValues && isObject(maybeValues)) {
      return {
        ...this.formInitialValues,
        ...maybeValues,
        start: maybeValues.start
          ? parseISO('' + maybeValues.start)
          : new Date(),
        end: maybeValues.end
          ? parseISO('' + maybeValues.end)
          : add(new Date(), { days: 1 }),
        surveyId: maybeValues.surveyId
          ? this.state.surveys.find(s => s.id === maybeValues.surveyId)
            ? maybeValues.surveyId
            : ''
          : '',
      };
    }

    return null;
  };

  get formInitialValues(): FormValues {
    return {
      name: '',
      description: '',
      placeName: '',
      placeAddress: '',
      start: new Date(),
      end: add(new Date(), { days: 1 }),
      surveyId: '',
    };
  }

  render() {
    const { isFetching, fetchErrorMsg } = this.state;

    return (
      <div className="container">
        <div className="columns">
          <div className="column is-10-tablet is-9-desktop is-8-widescreen is-6-fullhd">
            <div className="box">
              {isFetching && <SimpleSpinner text="Загрузка..." />}
              {fetchErrorMsg && (
                <div className="notification is-danger is-light">
                  Не удалось загрузить данные: {fetchErrorMsg}
                </div>
              )}
              {!isFetching && !fetchErrorMsg && (
                <>
                  <h3 className="title is-5 has-text-grey">
                    Новое мероприятие
                  </h3>
                  <Formik
                    initialValues={this.formInitialValues}
                    validationSchema={this.schema}
                    onSubmit={this.onSubmit}
                  >
                    {this.renderForm}
                  </Formik>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
