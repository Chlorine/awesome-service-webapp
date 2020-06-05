import React from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

import { SurveyQuestionInfo } from '../../../back/common/public-events/survey-question';
import { ArrayHelpers, FieldProps, Field as FormikField } from 'formik';

import './QuestionHelpers.scss';
import * as yup from 'yup';

export type AnswerType = SurveyQuestionInfo['answerType'];

export type AnswerVariantInfo = {
  text: string;
  dummy?: string; // потом какой-нибудь answerId
};

export const makeNewAnswerVariant = (): AnswerVariantInfo => {
  return {
    text: '',
    dummy: 'some-value',
  };
};

export const VALID_ANSWER_TYPES: AnswerType[] = ['YesNo', 'OneOf', 'SomeOf'];

export const ANSWER_TYPE_NAMES: {
  [id in SurveyQuestionInfo['answerType']]: string;
} = {
  YesNo: 'Да или Нет',
  OneOf: 'Один вариант из списка',
  SomeOf: 'Несколько вариантов из списка',
};

export const AnswerDragHandle = SortableHandle(() => (
  <span className="icon answer-drag-handle">
    <i className="fa fa-bars has-text-grey-lighter cursor-row-resize" />
  </span>
));

export type AnswerSortableElementProps = {
  currIndex: number;
  arrayHelpers: ArrayHelpers;
  showDragHandle: boolean;
  onChange?: () => void;
};

export const AnswerSortableElement = SortableElement(
  ({
    currIndex,
    arrayHelpers,
    showDragHandle,
    onChange,
  }: AnswerSortableElementProps) => {
    return (
      <li className="list-item">
        <FormikField name={`answers[${currIndex}].text`}>
          {({ field, form, meta }: FieldProps) => {
            return (
              <>
                <div className="field field-answer is-grouped">
                  <input
                    type={'text'}
                    placeholder="Текст варианта ответа"
                    className="input"
                    maxLength={256}
                    disabled={form.isSubmitting}
                    {...field}
                    onChange={e => {
                      form.handleChange(e);
                      onChange && onChange();
                    }}
                  />
                  <button
                    type="button"
                    className="delete delete-answer"
                    disabled={form.isSubmitting}
                    onClick={() => {
                      arrayHelpers.remove(currIndex);
                      onChange && onChange();
                    }}
                  />
                  {showDragHandle && <AnswerDragHandle />}
                </div>
                {meta.touched && meta.error && (
                  <p className="help has-text-danger">{meta.error}</p>
                )}
              </>
            );
          }}
        </FormikField>
      </li>
    );
  },
);

export type AnswersSortableContainerProps = {
  answers: AnswerVariantInfo[];
  arrayHelpers: ArrayHelpers;
  onChange?: () => void;
};

export const AnswersSortableContainer = SortableContainer(
  ({ answers, arrayHelpers, onChange }: AnswersSortableContainerProps) => {
    return (
      <ul className="list" style={{ marginBottom: '0.5rem' }}>
        {answers.length === 0 && (
          <li className="list-item has-text-grey-lighter">Добавьте варианты</li>
        )}
        {answers.map((answer, index) => (
          <AnswerSortableElement
            key={index}
            index={index}
            currIndex={index}
            arrayHelpers={arrayHelpers}
            showDragHandle={answers.length > 1}
            onChange={onChange}
          />
        ))}
      </ul>
    );
  },
);

export type QuestionFormValues = {
  text: string;
  description?: string;
  answerType: AnswerType;
  answers: AnswerVariantInfo[];
};

export function makeSchema() {
  return yup
    .object()
    .shape<QuestionFormValues>({
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
        .defined()
        // eslint-disable-next-line no-template-curly-in-string
        .max(32, 'Макс. количество вариантов ответа: ${max}')
        .test(
          'is-correct-count',
          'Требуется не менее двух вариантов ответа',
          function(arr) {
            if (this.resolve(yup.ref('answerType')) === 'YesNo') {
              return true;
            }

            return arr.length >= 2;
          },
        ),
    })
    .defined();
}
