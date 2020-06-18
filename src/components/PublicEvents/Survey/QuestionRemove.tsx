import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Actions as CurrentQuestionActions } from '../../../actions/current-question';
import { Actions as CurrentSurveyActions } from '../../../actions/current-survey';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';

import { TextInputField, SubmitButton } from '../../Common/Forms';
import { Alert } from '../../Common/Alert';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageSecondaryTitle,
} from '../../Common/ViewElements';

import { history, RootState } from '../../../store';

const mapStateToProps = (state: RootState) => {
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
    currentSurveyActions: bindActionCreators(CurrentSurveyActions, dispatch),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
  submitErrorMsg: string;
  dangerActionVisible: boolean;
};

// ввести название вопроса чтобы его удалить? типа как удаление репозитория в гитлабе
declare type FormValues = {
  text?: string;
};

class QuestionRemove extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    dangerActionVisible: false,
  };

  schema = yup.object().shape<FormValues>({
    text: yup
      .string()
      // .required()
      .max(255)
      .trim(),
  });

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Удаление вопроса';
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { setSubmitting } = actions;
    // const { text } = values;

    const question = this.props.currentQuestion.question!;

    this.setState({
      submitErrorMsg: '',
    });

    this.uh
      .wrap(
        api.events.exec('removeSurveyQuestion', {
          id: question.id,
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
          this.props.currentQuestionActions.infoReset();
          this.props.currentSurveyActions.questionRemoved(question.id);

          history.push(`/public-event-survey/${question.surveyId}/questions`);
        }
      });
  };

  renderForm = (fp: FormikProps<FormValues>) => {
    const { handleSubmit, isSubmitting } = fp;
    const { submitErrorMsg, dangerActionVisible } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Название ----------------------------------------*/}

        {false && (
          <TextInputField
            label="Текст"
            placeholder="Текст вопроса"
            fp={fp}
            name="text"
            maxLength={256}
          />
        )}

        {/* --- Ошибка сабмита ----------------------------------------*/}

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

        {!dangerActionVisible && (
          <div className="field">
            <button
              type="button"
              className="button submit-button is-warning"
              disabled={isSubmitting}
              onClick={() => this.setState({ dangerActionVisible: true })}
            >
              Удалить вопрос
            </button>
          </div>
        )}

        {dangerActionVisible && (
          <div className="field is-grouped">
            <p className="control">
              <button
                type="button"
                className="button submit-button"
                disabled={isSubmitting}
                onClick={() => this.setState({ dangerActionVisible: false })}
              >
                Отмена
              </button>
            </p>
            <p className="control">
              <SubmitButton
                text="Удалить"
                isSubmitting={isSubmitting}
                buttonClass="is-danger"
              />
            </p>
          </div>
        )}
      </form>
    );
  };

  get formInitialValues(): FormValues {
    const values: FormValues = {
      text: '',
    };

    const { question } = this.props.currentQuestion;

    if (question) {
      // const { text, description } = question;
      // values.text = text;
    }

    return values;
  }

  render() {
    const { isFetching, fetchErrorMsg, dangerActionVisible } = this.state;

    return (
      <div className="container">
        <div className="columns">
          <div className="column is-10-tablet is-9-desktop is-8-widescreen is-6-fullhd">
            <div className="box">
              <VEFetchingSpinner isFetching={isFetching} />
              <VEFetchError msg={fetchErrorMsg} />
              {!isFetching && !fetchErrorMsg && (
                <>
                  <VEPageSecondaryTitle
                    title="Удаление вопроса"
                    textClass={dangerActionVisible ? 'has-text-danger' : ''}
                  />
                  <p className="subtitle is-6">
                    В уже заполненных анкетах ответов на этот вопрос не будет
                  </p>
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

export default connect(mapStateToProps, mapDispatchToProps)(QuestionRemove);
