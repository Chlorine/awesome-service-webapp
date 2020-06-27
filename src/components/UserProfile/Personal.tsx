import React from 'react';
import * as yup from 'yup';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import { format, getDaysInMonth, parse, startOfDay } from 'date-fns';
import { bindActionCreators, Dispatch } from 'redux';
import loadImage from 'blueimp-load-image';

import api from '../../back/server-api';

import { UserInfo } from '../../back/common/users';
import { Params as UserApiParams } from '../../back/common/users/api';
import { SimpleSpinner } from '../Common/SimpleSpinner';
import { UnmountHelper } from '../../utils/unmount-helper';

import {
  FieldValidationStatus,
  SubmitButton,
  TextInputField,
} from '../Common/Forms';

import { Alert } from '../Common/Alert';

import './Personal.scss';
import { VEPageSecondaryTitle } from '../Common/ViewElements';
import ImageCropper from '../Common/ImageCropper';
import { RootState } from '../../store';
import { Actions as AuthActions } from '../../actions/auth';
import { connect } from 'react-redux';

const mapStateToProps = (state: RootState) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
  submitErrorMsg: string;
  userInfo?: UserInfo;
  submitOkMsgVisible: boolean;
  somethingChanged: boolean;

  avatarSrc: string;
  loadAvatarErrorMsg: string;
  cropModalVisible: boolean;
  cropSrc: string | null;
  croppedBlob: Blob | null;
};

declare type BirthdayValues = {
  bdDay: number;
  bdMonth: number;
  bdYear: number;
};

declare type FormValues = {
  firstName: string;
  middleName?: string;
  lastName: string;
  withBirthday?: boolean;
  gender?: 'male' | 'female';
} & BirthdayValues;

const _BD_YEAR = {
  max: new Date().getFullYear(),
  min: new Date().getFullYear() - 150,
};

class Personal extends React.Component<Props, State> {
  uh = new UnmountHelper();
  bdDayRef = React.createRef<HTMLInputElement>();
  imgRef = React.createRef<HTMLImageElement>();
  fileInputRef = React.createRef<HTMLInputElement>();

  avatarPreviewURL = '';

  state: State = {
    isFetching: true,
    fetchErrorMsg: '',
    submitErrorMsg: '',
    submitOkMsgVisible: false,
    somethingChanged: false,

    avatarSrc: '',
    loadAvatarErrorMsg: '',
    cropModalVisible: false,
    cropSrc: null,
    croppedBlob: null,
  };

  schema = yup.object().shape<FormValues>({
    firstName: yup
      .string()
      .required()
      .max(64)
      .trim(),
    middleName: yup
      .string()
      .max(64)
      .trim(),
    lastName: yup
      .string()
      .required()
      .max(64)
      .trim(),
    withBirthday: yup.boolean(),
    bdDay: yup
      .number()
      .required()
      .min(1)
      .test('is-correct-day-of-month', 'Некорректный день месяца', function(
        day,
      ) {
        if (!this.resolve(yup.ref('withBirthday'))) {
          return true;
        }

        let maxDayNr = 31;

        const year = this.resolve(yup.ref('bdYear'));
        if (year && 4 === String(year).length) {
          const month = this.resolve(yup.ref('bdMonth'));
          maxDayNr = getDaysInMonth(new Date(year, month));
        }

        return day <= maxDayNr;
      }),
    bdMonth: yup.number().required(),
    bdYear: yup
      .number()
      .required()
      .max(_BD_YEAR.max)
      .min(_BD_YEAR.min),
    gender: yup
      .mixed()
      .optional()
      .oneOf(['male', 'female']),
  });

  componentDidMount(): void {
    this.uh.onMount();
    document.title = 'Мои данные';

    this.setState({ isFetching: true, fetchErrorMsg: '' });

    this.uh
      .wrap(api.users.exec('getProfile', { __delay: 0, __genErr: false }))
      .then(({ err, results }) => {
        this.setState({ isFetching: false });

        if (err) {
          this.setState({ fetchErrorMsg: err.message });
        } else {
          const { userInfo } = results;
          this.setState({ userInfo, avatarSrc: userInfo.avatar || '' });
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();

    if (this.avatarPreviewURL) {
      URL.revokeObjectURL(this.avatarPreviewURL);
    }
  }

  onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    values = this.schema.cast(values) as FormValues;

    const { firstName, middleName, lastName, withBirthday, gender } = values;
    const { croppedBlob } = this.state;

    this.setState({
      submitErrorMsg: '',
      submitOkMsgVisible: false,
      loadAvatarErrorMsg: '',
    });

    const params: UserApiParams<'updateProfile'> = {
      firstName,
      middleName,
      lastName,
      gender,
    };

    if (withBirthday) {
      const { bdDay, bdMonth, bdYear } = values;
      params.birthday = format(new Date(bdYear, bdMonth, bdDay), 'yyyy-MM-dd');
    } else {
      params.birthday = null;
    }

    this.uh
      .wrap(
        (async () => {
          const { userInfo } = await api.users.exec('updateProfile', {
            ...params,
            __delay: 100,
            __genErr: false,
          });

          let avatarUrl: string | null = null;

          if (croppedBlob) {
            try {
              const uploadRes = await api.upload(
                { type: 'user-avatar', objectId: userInfo.id },
                new File([croppedBlob], 'avatar.jpg'),
              );

              avatarUrl = uploadRes.publicUrl || null;
            } catch (err) {
              throw new Error(
                `Ошибка загрузки картинки профиля (${err.message})`,
              );
            }

            if (avatarUrl) {
              userInfo.avatar = avatarUrl;
            }
          }

          return {
            userInfo,
          };
        })(),
      )
      .then(({ err, results }) => {
        actions.setSubmitting(false);

        if (err) {
          this.setState({ submitErrorMsg: err.message });
        } else {
          const { userInfo } = results;

          this.setState({
            userInfo,
            submitOkMsgVisible: true,
            somethingChanged: false,
            avatarSrc: userInfo.avatar || '',
            croppedBlob: null,
          });

          this.props.authActions.updateUserInfo(userInfo);

          this.uh.setTimeout(
            () => this.setState({ submitOkMsgVisible: false }),
            2000,
          );
        }
      });

    // this.uh
    //   .wrap(
    //     api.users.exec('updateProfile', {
    //       ...params,
    //       __delay: 100,
    //       __genErr: false,
    //     }),
    //   )
    //   .then(({ err, results }) => {
    //     actions.setSubmitting(false);
    //
    //     if (err) {
    //       this.setState({ submitErrorMsg: err.message });
    //     } else {
    //       const { userInfo } = results;
    //
    //       this.setState({
    //         userInfo,
    //         submitOkMsgVisible: true,
    //         somethingChanged: false,
    //       });
    //
    //       this.uh.setTimeout(
    //         () => this.setState({ submitOkMsgVisible: false }),
    //         2000,
    //       );
    //     }
    //   });
  };

  onFormValueChange = () => {
    this.setState({
      somethingChanged: true,
      submitOkMsgVisible: false,
    });
  };

  get userBirthday(): BirthdayValues {
    const { userInfo } = this.state;

    if (userInfo && userInfo.birthday) {
      try {
        const bd = parse(
          userInfo.birthday,
          'yyyy-MM-dd',
          startOfDay(new Date()),
        );

        return {
          bdDay: bd.getDate(),
          bdMonth: bd.getMonth(),
          bdYear: bd.getFullYear(),
        };
      } catch (err) {
        // oops
      }
    }

    return {
      bdDay: 1,
      bdMonth: 0,
      bdYear: 1970,
    };
  }

  renderForm = (fp: FormikProps<FormValues>) => {
    const {
      handleSubmit,
      isSubmitting,
      values,
      handleBlur,
      handleChange,
      setFieldValue,
    } = fp;
    const {
      submitErrorMsg,
      submitOkMsgVisible,
      somethingChanged,
      avatarSrc,
      loadAvatarErrorMsg,
    } = this.state;
    const { withBirthday } = values;

    return (
      <form noValidate onSubmit={handleSubmit}>
        <div className="columns is-desktop">
          <div className="column is-7-desktop">
            {/* --- Имя ----------------------------------------*/}

            <TextInputField
              label="Имя"
              placeholder="Иван"
              fp={fp}
              name={'firstName'}
              maxLength={65}
              onChange={this.onFormValueChange}
            />

            {/* --- Отчество ----------------------------------------*/}

            <TextInputField
              label="Отчество"
              placeholder="Иванович"
              fp={fp}
              name={'middleName'}
              maxLength={65}
              onChange={this.onFormValueChange}
            />

            {/* --- Фамилия ----------------------------------------*/}

            <TextInputField
              label="Фамилия"
              placeholder="Иванов"
              fp={fp}
              name={'lastName'}
              maxLength={65}
              onChange={this.onFormValueChange}
            />

            {/* --- День рождения ---------------------------------*/}

            {!withBirthday && (
              <div className="field">
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  className="has-text-link"
                  onClick={() => {
                    setFieldValue('withBirthday', true);
                    this.onFormValueChange();
                    setTimeout(
                      () =>
                        this.bdDayRef.current && this.bdDayRef.current.focus(),
                      22,
                    );
                  }}
                >
                  Указать день рождения
                </a>
              </div>
            )}

            {withBirthday && (
              <>
                <div
                  className="flex-row-centered bd-header-columns"
                  style={{ justifyContent: 'space-between' }}
                >
                  <div className="label">День рождения</div>
                  <div
                    className="has-tooltip-arrow has-tooltip-dark"
                    data-tooltip="Не указывать день рождения"
                  >
                    <button
                      type="button"
                      className="delete has-background-warning"
                      onClick={() => {
                        setFieldValue('withBirthday', false);
                        const defaultBD = this.userBirthday;
                        setFieldValue('bdDay', defaultBD.bdDay);
                        setFieldValue('bdMonth', defaultBD.bdMonth);
                        setFieldValue('bdYear', defaultBD.bdYear);
                        this.onFormValueChange();
                      }}
                    />
                  </div>
                </div>
                <div className="field">
                  <div className="columns is-mobile bd-columns">
                    <div className="column is-3">
                      <div className="control">
                        <input
                          ref={this.bdDayRef}
                          type="text"
                          inputMode="numeric"
                          name="bdDay"
                          placeholder="День"
                          className="input"
                          maxLength={2}
                          onBlur={handleBlur}
                          onChange={e => {
                            handleChange(e);
                            this.onFormValueChange();
                          }}
                          value={values.bdDay}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="column is-5">
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select
                            disabled={isSubmitting}
                            name="bdMonth"
                            value={values.bdMonth}
                            onChange={e => {
                              handleChange(e);
                              this.onFormValueChange();
                            }}
                            onBlur={handleBlur}
                          >
                            <option value="0">января</option>
                            <option value="1">февраля</option>
                            <option value="2">марта</option>
                            <option value="3">апреля</option>
                            <option value="4">мая</option>
                            <option value="5">июня</option>
                            <option value="6">июля</option>
                            <option value="7">августа</option>
                            <option value="8">сентября</option>
                            <option value="9">октября</option>
                            <option value="10">ноября</option>
                            <option value="11">декабря</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="column is-4">
                      <div className="control">
                        <input
                          type="text"
                          inputMode="numeric"
                          name="bdYear"
                          placeholder="Год"
                          className="input"
                          maxLength={4}
                          onBlur={handleBlur}
                          onChange={e => {
                            handleChange(e);
                            this.onFormValueChange();
                          }}
                          value={values.bdYear}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="container">
                    <FieldValidationStatus
                      fp={fp}
                      name={'bdDay'}
                      title="День"
                      clsNames="bd-validation-status"
                    />
                    <FieldValidationStatus
                      fp={fp}
                      name={'bdYear'}
                      title="Год"
                      clsNames="bd-validation-status"
                    />
                  </div>
                </div>
              </>
            )}

            {/* --- Пол ------------------ */}

            <div className="field">
              <label className="label">Пол</label>
              <div className="control">
                <label className="radio">
                  <input
                    type="radio"
                    name="gender"
                    checked={!values.gender}
                    disabled={isSubmitting}
                    onChange={() => {
                      setFieldValue('gender', undefined);
                      this.onFormValueChange();
                    }}
                  />{' '}
                  Не указан
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={values.gender === 'male'}
                    disabled={isSubmitting}
                    onChange={() => {
                      setFieldValue('gender', 'male');
                      this.onFormValueChange();
                    }}
                  />{' '}
                  Мужской
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={values.gender === 'female'}
                    disabled={isSubmitting}
                    onChange={() => {
                      setFieldValue('gender', 'female');
                      this.onFormValueChange();
                    }}
                  />{' '}
                  Женский
                </label>
              </div>
            </div>
          </div>
          <div className="column is-5-desktop">
            {/* --- Аватарчик --------------------------- */}

            <div className="field">
              <label className="label">Картинка профиля</label>
              {loadAvatarErrorMsg && (
                <Alert
                  type={'warning'}
                  onClose={() => this.setState({ loadAvatarErrorMsg: '' })}
                >
                  {loadAvatarErrorMsg}
                </Alert>
              )}
              {avatarSrc && (
                <div
                  style={{ maxWidth: 200, maxHeight: 200 }}
                  data-tooltip="Выбрать картинку"
                  className="has-tooltip-bottom has-tooltip-arrow"
                >
                  <figure className="image is-square mb-4">
                    <img
                      className="is-rounded avatar-with-shadow"
                      ref={this.imgRef}
                      src={this.state.avatarSrc}
                      alt=""
                      onClick={() =>
                        this.fileInputRef.current &&
                        this.fileInputRef.current.click()
                      }
                    />
                  </figure>
                </div>
              )}
              <div className="file">
                <label className="file-label">
                  <input
                    ref={this.fileInputRef}
                    className="file-input"
                    type="file"
                    name="avatar"
                    accept="image/*"
                    value="" // для onChange при выборе того же файла
                    onChange={this.onFileInputChange}
                    disabled={isSubmitting}
                    multiple={false}
                  />
                  <span className="file-cta">
                    <span className="file-icon">
                      <i className="fa fa-upload" />
                    </span>
                    <span className="file-label">Выбрать...</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
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

        {/* --- Уведомление об успешном сохранении -----------------------*/}

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

        {/*<div className="field">*/}
        {/*  <pre className="is-size-7">{JSON.stringify(values, null, 2)}</pre>*/}
        {/*</div>*/}

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
                  this.setState(
                    {
                      somethingChanged: false,
                      submitErrorMsg: '',
                      avatarSrc: this.state.userInfo!.avatar || '',
                      croppedBlob: null,
                    },
                    () => {
                      if (this.avatarPreviewURL) {
                        URL.revokeObjectURL(this.avatarPreviewURL);
                        this.avatarPreviewURL = '';
                      }
                    },
                  );
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

  onFileInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    if (files && files.length > 0) {
      this.setState({ loadAvatarErrorMsg: '' });

      // https://github.com/blueimp/JavaScript-Load-Image/#image-loading

      loadImage(
        files[0],
        maybeImg => {
          if ('type' in maybeImg && maybeImg.type === 'error') {
            this.setState({
              loadAvatarErrorMsg: `Ошибка загрузки изображения из файла`,
            });
          } else {
            this.setState({
              cropSrc: (maybeImg as HTMLCanvasElement).toDataURL('image/jpeg'),
              cropModalVisible: true,
            });
          }
        },
        { orientation: true, canvas: true },
      );
    }
  };

  get formInitialValues(): FormValues {
    let values: FormValues = {
      firstName: '',
      middleName: '',
      lastName: '',
      bdDay: 1,
      bdMonth: 0,
      bdYear: 1970,
      withBirthday: false,
      gender: undefined,
    };

    const { userInfo } = this.state;

    if (userInfo) {
      const { firstName, middleName, lastName, birthday, gender } = userInfo;

      values.firstName = firstName;
      values.middleName = middleName;
      values.lastName = lastName;
      values.gender = gender || undefined;

      values = { ...values, ...this.userBirthday, withBirthday: !!birthday };
    }

    return values;
  }

  handleCropResult = (blob: Blob) => {
    if (this.avatarPreviewURL) {
      URL.revokeObjectURL(this.avatarPreviewURL);
    }

    this.avatarPreviewURL = URL.createObjectURL(blob);

    this.setState({
      cropModalVisible: false,
      avatarSrc: this.avatarPreviewURL,
      croppedBlob: blob,
    });

    this.onFormValueChange();
  };

  render() {
    const {
      isFetching,
      fetchErrorMsg,
      userInfo,
      cropModalVisible,
    } = this.state;

    return (
      <>
        <ImageCropper
          aspect={1}
          circular={true}
          src={this.state.cropSrc}
          visible={cropModalVisible}
          handleCancel={() => this.setState({ cropModalVisible: false })}
          handleOk={this.handleCropResult}
        />
        <div className="container">
          {isFetching && (
            <div className="columns">
              <div className="column is-12">
                <SimpleSpinner text="Загрузка..." />
              </div>
            </div>
          )}
          {fetchErrorMsg && (
            <div className="columns">
              <div className="column is-12">
                <div className="notification is-danger is-light">
                  Не удалось загрузить данные пользователя: {fetchErrorMsg}
                </div>
              </div>
            </div>
          )}
          {!isFetching && !fetchErrorMsg && userInfo && (
            <>
              {!userInfo.emailConfirmed && (
                <div className="notification is-warning is-light">
                  Email не подтвержден
                </div>
              )}
              <div className="columns">
                <div className="column is-12tablet is-10-desktop is-8-widescreen">
                  <div className="box">
                    <VEPageSecondaryTitle title="Данные пользователя" />
                    <Formik
                      initialValues={this.formInitialValues}
                      enableReinitialize={true}
                      validationSchema={this.schema}
                      onSubmit={this.onSubmit}
                    >
                      {this.renderForm}
                    </Formik>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Personal);
