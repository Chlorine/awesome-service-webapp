import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';

import { add, isBefore, parseISO, startOfDay } from 'date-fns';
import { isObject } from 'lodash';
import DatePicker from 'react-datepicker';

import api from '../../back/server-api';

import { UnmountHelper } from '../../utils/unmount-helper';
import { SurveyInfo } from '../../back/common/public-events/survey';
import { history } from '../../store';

import { FormikPersist } from '../Common/FormikPersist';

import {
  FieldValidationStatus,
  TextInputField,
  SubmitButton,
} from '../Common/Forms';
import { Alert } from '../Common/Alert';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageSecondaryTitle,
} from '../Common/ViewElements';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
  submitErrorMsg: string;
  surveys: SurveyInfo[];
};

declare type FormValues = {
  name: string;
  description: string;
  placeName: string;
  placeAddress?: string;
  start: Date;
  end: Date;
  surveyId?: string;
};

export default class EventsCreateNew extends React.Component<Props, State> {
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
      .required()
      .max(512)
      .trim(),
    placeName: yup
      .string()
      .required()
      .max(255)
      .trim(),
    placeAddress: yup
      .string()
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
    this.uh.onMount();

    document.title = 'Новое мероприятие';

    this.setState({ isFetching: true, fetchErrorMsg: '' });

    this.uh
      .wrap(api.events.exec('getSurveys', { __delay: 0, __genErr: false }))
      .then(({ err, results }) => {
        if (err) {
          this.setState({ fetchErrorMsg: err.message });
        } else {
          const { surveys } = results;
          this.setState({ surveys });
        }

        this.setState({ isFetching: false });
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
          description: description,
          place: {
            name: placeName,
            address: placeAddress || '',
            location: undefined, // TODO: +map
          },
          start: start.toISOString(),
          end: end.toISOString(),
          surveyId: surveyId || undefined,
          // dbg:
          __delay: 100,
          __genErr: false,
        }),
      )
      .then(({ err, results }) => {
        setSubmitting(false);

        if (err) {
          this.setState({ submitErrorMsg: err.message });
        } else {
          const { event } = results;

          resetForm({});
          history.push(`/public-event/${event.id}`);
        }
      });
  };

  renderForm = (fp: FormikProps<FormValues>) => {
    const {
      handleSubmit,
      handleBlur,
      handleChange,
      values,
      isSubmitting,
      setFieldValue,
    } = fp;
    const { submitErrorMsg, surveys } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Название ----------------------------------------*/}

        <TextInputField
          label="Название"
          placeholder="Название мероприятия"
          fp={fp}
          name="name"
          maxLength={256}
        />

        {/* --- Описание ----------------------------------------*/}

        <TextInputField
          label="Описание"
          placeholder="Краткое описание мероприятия"
          fp={fp}
          name="description"
          maxLength={513}
          isTextarea={true}
        />

        {/* --- Название места проведения --------------*/}

        <TextInputField
          label="Место проведения"
          placeholder="Название места проведения"
          fp={fp}
          name="placeName"
          maxLength={256}
        />

        {/* --- Адрес места проведения --------------*/}

        <TextInputField
          label="Адрес места проведения"
          placeholder="Адрес места проведения"
          fp={fp}
          name="placeAddress"
          maxLength={513}
          isTextarea={true}
          rows={3}
        />

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
                    disabled={isSubmitting}
                  />
                </div>
                <FieldValidationStatus fp={fp} name="start" />
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
                    disabled={isSubmitting}
                  />
                </div>
                <FieldValidationStatus fp={fp} name="end" />
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
                disabled={isSubmitting}
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
            <Alert
              type={'danger'}
              onClose={() => this.setState({ submitErrorMsg: '' })}
            >
              {submitErrorMsg}
            </Alert>
          </div>
        )}

        {/* --- Сабмит ----------------------------------------*/}

        <div className="field">
          <SubmitButton
            text="Создать мероприятие"
            isSubmitting={isSubmitting}
          />
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
              <VEFetchingSpinner isFetching={isFetching} />
              <VEFetchError msg={fetchErrorMsg} />
              {!isFetching && !fetchErrorMsg && (
                <>
                  <VEPageSecondaryTitle title="Новое мероприятие" />
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
