import React from 'react';

import {
  Formik,
  FormikProps,
  FormikHelpers,
  FieldArray as FormikFieldArray,
} from 'formik';

import arrayMove from 'array-move';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Actions as CurrentSurveyActions } from '../../../actions/current-survey';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';
import { history, RootState } from '../../../store';
import { FormikPersist } from '../../Common/FormikPersist';

import {
  TextInputField,
  SubmitButton,
  FieldValidationStatus,
} from '../../Common/Forms';

import { Alert } from '../../Common/Alert';

import {
  VEFetchError,
  VEFetchingSpinner,
  VELinkButton,
  VEPageSecondaryTitle,
} from '../../Common/ViewElements';

import { isObject } from 'lodash';
import { SurveyQuestionInfo } from '../../../back/common/public-events/survey-question';

import {
  ANSWER_TYPE_NAMES,
  makeNewAnswerVariant,
  AnswersSortableContainer,
  QuestionFormValues,
  makeSchema,
} from './QuestionHelpers';

const mapStateToProps = (state: RootState) => {
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
  sortingInProgress: boolean;
};

type FormValues = QuestionFormValues;

class SurveysCreateNew extends React.Component<Props, State> {
  firstFieldRef = React.createRef<any>();
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    sortingInProgress: false,
  };

  schema = makeSchema();

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Новый вопрос';

    this.firstFieldRef.current && this.firstFieldRef.current.focus();
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    console.log('submit', JSON.stringify(values, null, 2));

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
    const { submitErrorMsg, sortingInProgress } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Название ----------------------------------------*/}

        <TextInputField
          label="Текст"
          placeholder="Текст вопроса"
          fp={fp}
          name="text"
          maxLength={256}
          innerRef={this.firstFieldRef}
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

        {values.answerType !== 'YesNo' && (
          <div className="field">
            <FormikFieldArray
              name="answers"
              render={arrayHelpers => {
                return (
                  <>
                    <div className="field">
                      <div className="columns is-gapless is-mobile">
                        <div className="column label">Варианты ответов</div>
                        {values.answers.length > 0 && (
                          <div className="column has-text-right">
                            <VELinkButton
                              text="Добавить"
                              disabled={isSubmitting}
                              onClick={() =>
                                arrayHelpers.push(makeNewAnswerVariant())
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <AnswersSortableContainer
                      answers={values.answers}
                      arrayHelpers={arrayHelpers}
                      lockAxis={'y'}
                      shouldCancelStart={() => isSubmitting}
                      useDragHandle={true}
                      onSortStart={() =>
                        this.setState({ sortingInProgress: true })
                      }
                      onSortEnd={({ newIndex, oldIndex }) => {
                        this.setState({ sortingInProgress: false });
                        if (oldIndex !== newIndex) {
                          fp.setFieldValue(
                            'answers',
                            arrayMove(values.answers, oldIndex, newIndex),
                          );
                        }
                      }}
                      handleAdd={() =>
                        arrayHelpers.push(makeNewAnswerVariant())
                      }
                      sortingInProgress={sortingInProgress}
                    />
                  </>
                );
              }}
            />
            <FieldValidationStatus fp={fp} name="answers" />
          </div>
        )}

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
      };
    }

    return null;
  };

  get formInitialValues(): FormValues {
    return {
      text: '',
      description: '',
      answerType: 'YesNo',
      answers: [],
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
