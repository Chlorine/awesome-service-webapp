import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { add, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';

import { AppState } from '../../../store/state';
import { Actions as CurrentEventActions } from '../../../actions/current-event';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';
import { SimpleSpinner } from '../../Common/SimpleSpinner';
import { SurveyInfo } from '../../../back/common/public-events/survey';
import { Alert } from '../../Common/Alert';
import {
  FieldValidationStatus,
  SubmitButton,
  TextInputField,
} from '../../Common/Forms';

const mapStateToProps = (state: AppState) => {
  return {
    currentEvent: state.currentEvent,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    currentEventActions: bindActionCreators(CurrentEventActions, dispatch),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
  submitErrorMsg: string;
  submitOkMsgVisible: boolean;
  somethingChanged: boolean;
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

class EventEdit extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: true,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    submitOkMsgVisible: false,
    somethingChanged: false,
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
    start: yup.date().required(),
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

    document.title = 'Изменение параметров мероприятия';

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

    const {
      name,
      description,
      placeName,
      placeAddress,
      start,
      end,
      surveyId,
    } = values;
    const { event } = this.props.currentEvent;

    this.setState({
      submitErrorMsg: '',
      submitOkMsgVisible: false,
    });

    this.uh
      .wrap(
        api.events.exec('updateEvent', {
          id: event!.id,
          name,
          description,
          place: {
            name: placeName,
            address: placeAddress,
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
        actions.setSubmitting(false);

        if (err) {
          this.setState({ submitErrorMsg: err.message });
        } else {
          const { event } = results;

          this.props.currentEventActions.eventInfoLoaded(event);

          this.setState({
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

  renderForm = (fp: FormikProps<FormValues>) => {
    const {
      handleSubmit,
      handleBlur,
      handleChange,
      values,
      isSubmitting,
      setFieldValue,
    } = fp;

    const {
      submitErrorMsg,
      submitOkMsgVisible,
      somethingChanged,
      surveys,
    } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Название ----------------------------------------*/}

        <TextInputField
          label="Название"
          placeholder="Название мероприятия"
          fp={fp}
          name="name"
          maxLength={256}
          onChange={this.onFormValueChange}
        />

        {/* --- Описание ----------------------------------------*/}

        <TextInputField
          label="Описание"
          placeholder="Краткое описание мероприятия"
          fp={fp}
          name="description"
          maxLength={513}
          onChange={this.onFormValueChange}
          isTextarea={true}
        />

        {/* --- Название места проведения --------------*/}

        <TextInputField
          label="Место проведения"
          placeholder="Название места проведения"
          fp={fp}
          name="placeName"
          maxLength={256}
          onChange={this.onFormValueChange}
        />

        {/* --- Адрес места проведения --------------*/}

        <TextInputField
          label="Адрес места проведения"
          placeholder="Адрес места проведения"
          fp={fp}
          name="placeAddress"
          maxLength={513}
          onChange={this.onFormValueChange}
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
                    onChange={date => {
                      setFieldValue('start', date);
                      this.onFormValueChange();
                    }}
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
                    onChange={date => {
                      setFieldValue('end', date);
                      this.onFormValueChange();
                    }}
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
                onChange={e => {
                  this.setState({
                    somethingChanged: true,
                    submitOkMsgVisible: false,
                  });
                  handleChange(e);
                }}
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

        {/* --- Сообщ. об успешном сохранении -----------------------------*/}

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

        {/* --- Сабмит ----------------------------------------*/}

        {somethingChanged && !submitOkMsgVisible && (
          <div className="field">
            <SubmitButton
              text="Сохранить изменения"
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </form>
    );
  };

  get formInitialValues(): FormValues {
    const values: FormValues = {
      name: '',
      description: '',
      placeName: '',
      placeAddress: '',
      start: new Date(),
      end: add(new Date(), { days: 1 }),
      surveyId: '',
    };

    const { event } = this.props.currentEvent;

    if (event) {
      const { name, description, place, start, end, surveyId } = event;

      values.name = name;
      values.description = description;
      values.placeName = place.name;
      values.placeAddress = place.address;

      values.start = parseISO(start);
      values.end = parseISO(end);
      values.surveyId = surveyId || '';
    }

    return values;
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
                    Параметры мероприятия
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

export default connect(mapStateToProps, mapDispatchToProps)(EventEdit);
