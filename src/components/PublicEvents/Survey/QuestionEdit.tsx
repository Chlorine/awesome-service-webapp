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

import { AppState } from '../../../store/state';
import { Actions as CurrentQuestionActions } from '../../../actions/current-question';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';

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

import {
  ANSWER_TYPE_NAMES,
  makeNewAnswerVariant,
  QuestionFormValues,
  makeSchema,
  AnswersSortableContainer,
} from './QuestionHelpers';
import { SurveyQuestionInfo } from '../../../back/common/public-events/survey-question';

const mapStateToProps = (state: AppState) => {
  return {
    currentQuestion: state.currentQuestion,
    currentSurvey: state.currentSurvey,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    currentQuestionActions: bindActionCreators(
      CurrentQuestionActions,
      dispatch,
    ),
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
};

type FormValues = QuestionFormValues;

class QuestionEdit extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    submitOkMsgVisible: false,
    somethingChanged: false,
  };

  schema = makeSchema();

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Изменение параметров вопроса';
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { setSubmitting } = actions;
    const { text, description, answerType, answers } = values;

    const question = this.props.currentQuestion.question!;

    this.setState({
      submitErrorMsg: '',
      submitOkMsgVisible: false,
    });

    this.uh
      .wrap(
        api.events.exec('updateSurveyQuestion', {
          id: question.id,
          text,
          description: description,
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

          this.props.currentQuestionActions.infoLoaded(question);
          document.title = question.text;

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
    const { handleSubmit, isSubmitting, values, handleChange, handleBlur } = fp;
    const { submitErrorMsg, submitOkMsgVisible, somethingChanged } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Название ----------------------------------------*/}

        <TextInputField
          label="Текст"
          placeholder="Текст вопроса"
          fp={fp}
          name="text"
          maxLength={256}
          onChange={this.onFormValueChange}
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
          onChange={this.onFormValueChange}
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
                onChange={e => {
                  handleChange(e);
                  this.onFormValueChange();
                }}
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
                        <div className="column has-text-right">
                          <VELinkButton
                            text="Добавить"
                            onClick={() => {
                              arrayHelpers.push(makeNewAnswerVariant());
                              this.onFormValueChange();
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <AnswersSortableContainer
                      answers={values.answers}
                      arrayHelpers={arrayHelpers}
                      lockAxis={'y'}
                      shouldCancelStart={() => isSubmitting}
                      useDragHandle={true}
                      onSortEnd={({ newIndex, oldIndex }) => {
                        if (oldIndex !== newIndex) {
                          fp.setFieldValue(
                            'answers',
                            arrayMove(values.answers, oldIndex, newIndex),
                          );
                          this.onFormValueChange();
                        }
                      }}
                      onChange={this.onFormValueChange}
                    />
                  </>
                );
              }}
            />
            <FieldValidationStatus fp={fp} name="answers" />
          </div>
        )}

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
    const values: FormValues = {
      text: '',
      description: '',
      answerType: 'YesNo',
      answers: [],
    };

    const { question } = this.props.currentQuestion;

    if (question) {
      const { text, description, answerType, answerVariants } = question;

      values.text = text;
      values.description = description;
      values.answerType = answerType;
      values.answers = answerVariants.map(av => ({ text: av }));
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
              <VEFetchingSpinner isFetching={isFetching} />
              <VEFetchError msg={fetchErrorMsg} />
              {!isFetching && !fetchErrorMsg && (
                <>
                  <VEPageSecondaryTitle title="Параметры вопроса" />
                  <Formik
                    initialValues={this.formInitialValues}
                    validationSchema={this.schema}
                    onSubmit={this.onSubmit}
                    enableReinitialize={true}
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

export default connect(mapStateToProps, mapDispatchToProps)(QuestionEdit);
