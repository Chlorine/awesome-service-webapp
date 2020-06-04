import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';

import api from '../../back/server-api';

import { UnmountHelper } from '../../utils/unmount-helper';
import { history } from '../../store';

import { FormikPersist } from '../Common/FormikPersist';

import { TextInputField, SubmitButton } from '../Common/Forms';
import { Alert } from '../Common/Alert';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageSecondaryTitle,
} from '../Common/ViewElements';

import { isObject } from 'lodash';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
  submitErrorMsg: string;
};

declare type FormValues = {
  name: string;
  description?: string;
};

export default class SurveysCreateNew extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    fetchErrorMsg: '',
    submitErrorMsg: '',
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
    this.uh.onMount();

    document.title = 'Новая анкета';
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { setSubmitting, resetForm } = actions;

    const { name, description } = values;

    this.setState({
      submitErrorMsg: '',
    });

    this.uh
      .wrap(
        api.events.exec('createSurvey', {
          name,
          description: description,
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
          const { survey } = results;

          resetForm({});
          history.push(`/public-event-survey/${survey.id}`);
        }
      });
  };

  renderForm = (fp: FormikProps<FormValues>) => {
    const { handleSubmit, isSubmitting } = fp;
    const { submitErrorMsg } = this.state;

    return (
      <form noValidate onSubmit={handleSubmit}>
        {/* --- Название ----------------------------------------*/}

        <TextInputField
          label="Название"
          placeholder="Название анкеты"
          fp={fp}
          name="name"
          maxLength={256}
        />

        {/* --- Описание ----------------------------------------*/}

        <TextInputField
          label="Описание"
          placeholder="Краткое описание"
          fp={fp}
          name="description"
          maxLength={513}
          isTextarea={true}
          rows={3}
        />

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
          <SubmitButton text="Создать анкету" isSubmitting={isSubmitting} />
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
    return 'survey-create-form-v01';
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
      name: '',
      description: '',
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
                  <VEPageSecondaryTitle title="Новая анкета" />
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
