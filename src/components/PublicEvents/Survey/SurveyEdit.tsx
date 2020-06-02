import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { AppState } from '../../../store/state';
import { Actions as CurrentSurveyActions } from '../../../actions/current-survey';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';
import { Alert } from '../../Common/Alert';
import { SubmitButton, TextInputField } from '../../Common/Forms';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageSecondaryTitle,
} from '../../Common/ViewElements';

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
  submitOkMsgVisible: boolean;
  somethingChanged: boolean;
};

declare type FormValues = {
  name: string;
  description?: string;
};

class SurveyEdit extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    submitOkMsgVisible: false,
    somethingChanged: false,
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
  });

  componentDidMount(): void {
    document.title = 'Изменение параметров анкеты';
    this.uh.onMount();
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { name, description } = values;
    const { survey } = this.props.currentSurvey;

    this.setState({
      submitErrorMsg: '',
      submitOkMsgVisible: false,
    });

    this.uh
      .wrap(
        api.events.exec('updateSurvey', {
          id: survey!.id,
          name,
          description,
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
          const { survey } = results;

          this.props.currentSurveyActions.surveyInfoLoaded(survey);

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
          label="Название"
          placeholder="Название анкеты"
          fp={fp}
          name="name"
          maxLength={256}
          onChange={this.onFormValueChange}
        />

        {/* --- Описание ----------------------------------------*/}

        <TextInputField
          label="Описание"
          placeholder="Краткое описание"
          fp={fp}
          name="description"
          maxLength={513}
          onChange={this.onFormValueChange}
          isTextarea={true}
          rows={3}
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
      name: '',
      description: '',
    };

    const { survey } = this.props.currentSurvey;

    if (survey) {
      const { name, description } = survey;

      values.name = name;
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
              <div className="container">
                <VEFetchingSpinner isFetching={isFetching} />
                <VEFetchError msg={fetchErrorMsg} />
                {!isFetching && !fetchErrorMsg && (
                  <>
                    <VEPageSecondaryTitle title={'Параметры анкеты'} />
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
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SurveyEdit);
