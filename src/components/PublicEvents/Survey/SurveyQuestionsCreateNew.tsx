import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers, FieldArray } from 'formik';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { AppState } from '../../../store/state';
import { Actions as CurrentSurveyActions } from '../../../actions/current-survey';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';
import { history } from '../../../store';

import { FormikPersist } from '../../Common/FormikPersist';

import { TextInputField, SubmitButton } from '../../Common/Forms';
import { Alert } from '../../Common/Alert';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageSecondaryTitle,
} from '../../Common/ViewElements';

import { isObject } from 'lodash';
import { SurveyQuestionInfo } from '../../../back/common/public-events/survey-question';

const mapStateToProps = (state: AppState) => {
  return {
    currentSurvey: state.currentSurvey,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    currentSurveyActions: bindActionCreators(CurrentSurveyActions, dispatch),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
  submitErrorMsg: string;
};

declare type AnswerVariantInfo = {
  text: string;
  dummy?: string;
};

// declare type FormValues = {
//   text: string;
//   description?: string;
//   answerType: SurveyQuestionInfo['answerType'];
//   answers: AnswerVariantInfo[];
// };

export const VALID_ANSWER_TYPES: SurveyQuestionInfo['answerType'][] = [
  'YesNo',
  'OneOf',
  'SomeOf',
];

export const ANSWER_TYPE_NAMES: {
  [id in SurveyQuestionInfo['answerType']]: string;
} = {
  YesNo: 'Да или Нет',
  OneOf: 'Один вариант из списка',
  SomeOf: 'Несколько вариантов из списка',
};

const _schema = yup
  .object()
  .shape({
    text: yup
      .string()
      .required()
      .max(255)
      .trim(),
    description: yup
      .string()
      .max(512)
      .trim(),
    answerType: yup
      .mixed()
      .required()
      .oneOf(VALID_ANSWER_TYPES),
    answers: yup
      .array()
      .of(
        yup
          .object()
          .shape({
            text: yup
              .string()
              .required()
              .max(255)
              .trim(),
            dummy: yup.string().max(255),
          })
          .defined(),
      )
      .defined(),
  })
  .defined();

type FormValues = yup.InferType<typeof _schema>;

class SurveysCreateNew extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    fetchErrorMsg: '',
    submitErrorMsg: '',
  };

  schema = _schema;
  // schema = yup.object().shape<FormValues>({
  //   text: yup
  //     .string()
  //     .required()
  //     .max(255)
  //     .trim(),
  //   description: yup
  //     .string()
  //     .max(512)
  //     .trim(),
  //   answerType: yup
  //     .string()
  //     .required()
  //     .oneOf(VALID_ANSWER_TYPES),
  //   answers: yup
  //     .array()
  //     .of(
  //       yup.object().shape<AnswerVariantInfo>({
  //         text: yup
  //           .string()
  //           .required()
  //           .max(255)
  //           .trim(),
  //         dummy: yup.string().max(255),
  //       }),
  //     )
  //     .required(),
  // });

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Новый вопрос';
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { setSubmitting, resetForm } = actions;
    const { text, description, answerType, answers } = values;

    const survey = this.props.currentSurvey.survey!;

    this.setState({
      submitErrorMsg: '',
    });

    this.uh
      .wrap(
        api.events.exec('createSurveyQuestion', {
          surveyId: survey.id,
          text,
          description,
          answerType,
          answerVariants:
            answerType !== 'YesNo' ? answers.map(a => a.text) : undefined,
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
          const { question } = results;

          this.props.currentSurveyActions.questionCreated(question);

          resetForm({});
          history.push(`/public-event-survey/${survey.id}/questions`);
        }
      });
  };

  renderForm = (fp: FormikProps<FormValues>) => {
    const { handleSubmit, isSubmitting, values, handleChange, handleBlur } = fp;
    const { submitErrorMsg } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Название ----------------------------------------*/}

        <TextInputField
          label="Текст"
          placeholder="Текст вопроса"
          fp={fp}
          name="text"
          maxLength={256}
        />

        {/* --- Описание ----------------------------------------*/}

        <TextInputField
          label="Пояснение"
          placeholder="Пояснение к вопросу"
          fp={fp}
          name="description"
          maxLength={513}
          isTextarea={true}
          rows={3}
        />

        {/* --- Тип ответа ------------------------- */}

        <div className="field">
          <label htmlFor="" className="label">
            Тип ответа
          </label>
          <div className="control">
            <div className="select">
              <select
                name="answerType"
                value={values.answerType}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
              >
                {Object.keys(ANSWER_TYPE_NAMES).map((key, index) => {
                  const answerType = key as SurveyQuestionInfo['answerType'];
                  return (
                    <option key={index} value={answerType}>
                      {ANSWER_TYPE_NAMES[answerType]}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* --- Варианты ответов -------------------------*/}

        <div className="field">
          <label htmlFor="" className="label has-text-grey-light">
            Варианты ответов
          </label>
          <FieldArray
            name="answers"
            render={props => {
              return (
                <ul className="list">
                  <li className="list-item has-text-grey-light">
                    В разработке{' '}
                    <span className="icon">
                      <i className="fa fa-meh-o" />
                    </span>
                  </li>
                </ul>
              );
            }}
          />
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

        {/*<div className="field">{JSON.stringify(fp.values)}</div>*/}

        {/*<div className="field">{JSON.stringify(fp.errors)}</div>*/}

        <div className="field">
          <br />
          <SubmitButton text="Создать вопрос" isSubmitting={isSubmitting} />
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
    return 'survey-question-create-form-v01';
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
        // answers: []
      };
    }

    return null;
  };

  get formInitialValues(): FormValues {
    return {
      text: '',
      description: '',
      answerType: 'YesNo',
      answers: [{ text: 'test', dummy: '' }],
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
                  <VEPageSecondaryTitle title="Новый вопрос" />
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

export default connect(mapStateToProps, mapDispatchToProps)(SurveysCreateNew);
