import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { AppState } from '../../../store/state';
import { Actions as CurrentQuestionActions } from '../../../actions/current-question';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';

import { TextInputField, SubmitButton } from '../../Common/Forms';
import { Alert } from '../../Common/Alert';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageSecondaryTitle,
} from '../../Common/ViewElements';

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

declare type FormValues = {
  text: string;
  description?: string;
};

class QuestionEdit extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    submitOkMsgVisible: false,
    somethingChanged: false,
  };

  schema = yup.object().shape<FormValues>({
    text: yup
      .string()
      .required()
      .max(255)
      .trim(),
    description: yup
      .string()
      .max(512)
      .trim(),
  });

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
    const { text, description } = values;

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
          answerType: 'YesNo',
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
    const { handleSubmit, isSubmitting } = fp;
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
      text: '',
      description: '',
    };

    const { question } = this.props.currentQuestion;

    if (question) {
      const { text, description } = question;

      values.text = text;
      values.description = description;
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
