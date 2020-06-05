import React from 'react';
import { FormikProps } from 'formik';
import classNames from 'classnames';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

export interface InputProps<Values, FieldName extends keyof Values> {
  type?: 'text' | 'email' | 'password';
  label: string;
  placeholder?: string;
  fp: FormikProps<Values>;
  name: FieldName;
  maxLength?: number;
  onChange?: (e: any) => void;
  leftIcon?: string;
  rightButtonIcon?: string;
  onButtonClick?: (e: any) => void;
  children?: any;
  isTextarea?: boolean;
  rows?: number;
  innerRef?: any;
}

export function TextInputField<Values, FieldName extends keyof Values>({
  type,
  label,
  placeholder,
  fp,
  name,
  maxLength,
  onChange,
  leftIcon,
  rightButtonIcon,
  onButtonClick,
  children,
  isTextarea,
  rows,
  innerRef,
}: InputProps<Values, FieldName>) {
  const { handleChange, handleBlur, values, isSubmitting } = fp;

  return (
    <>
      {!!label && (
        <label htmlFor="" className="label">
          {label}
        </label>
      )}
      <div className={classNames('field', { 'has-addons': !!rightButtonIcon })}>
        <div
          className={classNames('control', {
            'has-icons-left': !!leftIcon,
            'is-expanded': !!rightButtonIcon,
          })}
        >
          {isTextarea && (
            <textarea
              name={name as string}
              placeholder={placeholder}
              className="textarea"
              maxLength={maxLength}
              onBlur={handleBlur}
              onChange={e => {
                handleChange(e);
                onChange && onChange(e);
              }}
              value={String(values[name])}
              disabled={isSubmitting}
              rows={rows}
            />
          )}
          {!isTextarea && (
            <input
              ref={innerRef}
              type={type || 'text'}
              name={name as string}
              placeholder={placeholder}
              className="input"
              maxLength={maxLength}
              onBlur={handleBlur}
              onChange={e => {
                handleChange(e);
                onChange && onChange(e);
              }}
              value={String(values[name])}
              disabled={isSubmitting}
            />
          )}
          {leftIcon && (
            <span className="icon is-small is-left">
              <i className={'fa ' + leftIcon} />
            </span>
          )}
          <FieldValidationStatus fp={fp} name={name} />
          {/* --- тут дополнительные штуки --------------*/}
          {children}
        </div>
        {!!rightButtonIcon && (
          <div className="control">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              href={'#'}
              className="button is-outlined"
              onClick={onButtonClick}
            >
              <span className="icon is-small">
                <i className={'fa ' + rightButtonIcon} />
              </span>
            </a>
          </div>
        )}
      </div>
    </>
  );
}

export interface IPasswordInputProps<Values, FieldName extends keyof Values>
  extends InputProps<Values, FieldName> {
  enableEyeButton?: boolean;
  eyeIcon?: string[];
  enableStrengthMeter?: boolean;
  strengthMeterCaption?: string;
  visiblePlaceholder?: string;
}

export function PasswordInputField<Values, FieldName extends keyof Values>({
  enableEyeButton,
  eyeIcon,
  enableStrengthMeter,
  strengthMeterCaption,
  visiblePlaceholder,
  ...props
}: IPasswordInputProps<Values, FieldName>) {
  const { values } = props.fp;
  const [pswVisible, setPswVisible] = React.useState<boolean>(false);

  if (!eyeIcon) {
    eyeIcon = ['fa-eye-slash', 'fa-eye'];
  }

  return (
    <>
      <TextInputField
        {...props}
        type={pswVisible ? 'text' : 'password'}
        placeholder={
          pswVisible ? visiblePlaceholder || 'Звездочки' : '********'
        }
        rightButtonIcon={
          enableEyeButton ? eyeIcon[pswVisible ? 0 : 1] : undefined
        }
        onButtonClick={() => setPswVisible(!pswVisible)}
      >
        {enableStrengthMeter && values[props.name] && (
          <p className="help">
            <PasswordStrengthMeter
              password={String(values[props.name])}
              caption={strengthMeterCaption}
            />
          </p>
        )}
      </TextInputField>
    </>
  );
}

export const SubmitButton: React.FC<{
  text: string;
  isSubmitting: boolean;
  buttonClass?: string;
}> = ({ text, isSubmitting, buttonClass }) => {
  return (
    <button
      type="submit"
      className={classNames(
        `button submit-button ${buttonClass || 'is-primary'}`,
        {
          'is-loading': isSubmitting,
        },
      )}
      disabled={isSubmitting}
    >
      {text}
    </button>
  );
};

export type FieldValidationStatusProps<
  Values,
  FieldName extends keyof Values
> = {
  fp: FormikProps<Values>;
  name: FieldName;
  title?: string;
};

export function FieldValidationStatus<Values, FieldName extends keyof Values>({
  name,
  fp,
  title,
}: FieldValidationStatusProps<Values, FieldName>) {
  const { touched, errors } = fp;

  return touched[name] && errors[name] && typeof errors[name] === 'string' ? (
    <p className="help">
      {title && (
        <strong className="has-text-grey">
          {title}
          {': '}
        </strong>
      )}
      <span className="has-text-danger">{errors[name]}</span>
    </p>
  ) : null;
}
