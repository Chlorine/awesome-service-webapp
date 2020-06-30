import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { Actions as CurrentEventActions } from '../../../actions/current-event';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';
import { Alert } from '../../Common/Alert';
import { RootState } from '../../../store';

import { UploadParamsBase } from '../../../back/common';
import ImageCropper from '../../Common/ImageCropper';
import { loadImageFromFile } from '../../../utils/image-utils';
import { ConfirmModal } from '../../Common/ConfirmModal';
import { Params } from '../../../back/common/public-events/api';

const mapStateToProps = (state: RootState) => {
  return {
    currentEvent: state.currentEvent,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    currentEventActions: bindActionCreators(CurrentEventActions, dispatch),
  };
};

export type EventImageProps = {
  title: string;
  subtitle: string;
  objectType: UploadParamsBase['type'];
  cropAspectRatio: number;
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  EventImageProps;

declare type State = {
  isSubmitting: boolean;
  submitErrorMsg: string;
  submitOkMsgVisible: boolean;
  somethingChanged: boolean;

  imageSrc: string;
  loadImageErrorMsg: string;
  newImageIsPng: boolean;
  cropModalVisible: boolean;
  cropSrc: string | null;
  croppedBlob: Blob | null;

  removeConfirmModalVisible: boolean;
};

class EventImage extends React.Component<Props, State> {
  uh = new UnmountHelper();

  imgRef = React.createRef<HTMLImageElement>();
  fileInputRef = React.createRef<HTMLInputElement>();
  imagePreviewURL = '';

  state: State = {
    isSubmitting: false,
    submitErrorMsg: '',
    submitOkMsgVisible: false,
    somethingChanged: false,

    imageSrc: '',
    loadImageErrorMsg: '',
    newImageIsPng: false,
    cropModalVisible: false,
    cropSrc: null,
    croppedBlob: null,

    removeConfirmModalVisible: false,
  };

  componentDidMount(): void {
    this.uh.onMount();

    const { title } = this.props;
    document.title = title;
    this.setState({ imageSrc: this.defaultImageSrc });
  }

  get defaultImageSrc(): string {
    const { event } = this.props.currentEvent;

    switch (this.props.objectType) {
      case 'public-event-banner':
        return event!.banner || '';
      case 'public-event-logo':
        return event!.logo || '';
    }

    return '';
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();

    if (this.imagePreviewURL) {
      URL.revokeObjectURL(this.imagePreviewURL);
    }
  }

  private get fileToUpload(): Blob {
    const { croppedBlob, newImageIsPng } = this.state;
    const ext = newImageIsPng ? 'png' : 'jpg';

    return new File([croppedBlob!], `event-media.${ext}`);
  }

  onSubmit = () => {
    const { event } = this.props.currentEvent;
    const { objectType } = this.props;

    this.setState({
      isSubmitting: true,
      submitErrorMsg: '',
      submitOkMsgVisible: false,
    });

    this.uh
      .wrap(
        api.upload(
          { type: objectType, objectId: event!.id },
          this.fileToUpload,
        ),
      )
      .then(({ err, results }) => {
        this.setState({ isSubmitting: false });

        if (err) {
          this.setState({ submitErrorMsg: err.message });
        } else {
          const { publicUrl } = results;
          const { eventMediaChanged } = this.props.currentEventActions;

          if (objectType === 'public-event-banner') {
            eventMediaChanged({ banner: publicUrl });
          } else if (objectType === 'public-event-logo') {
            eventMediaChanged({ logo: publicUrl });
          }

          this.setState({
            submitOkMsgVisible: true,
            somethingChanged: false,
            imageSrc: publicUrl!,
            croppedBlob: null,
          });

          this.uh.setTimeout(
            () => this.setState({ submitOkMsgVisible: false }),
            2000,
          );
        }
      });
  };

  onFileInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    if (files && files.length > 0) {
      this.setState({ loadImageErrorMsg: '' });

      loadImageFromFile(files[0])
        .then(({ isPng, dataURL }) =>
          this.setState({
            newImageIsPng: isPng,
            cropSrc: dataURL,
            cropModalVisible: true,
          }),
        )
        .catch(err => this.setState({ loadImageErrorMsg: err.message }));
    }
  };

  handleCropResult = (blob: Blob) => {
    if (this.imagePreviewURL) {
      URL.revokeObjectURL(this.imagePreviewURL);
    }

    this.imagePreviewURL = URL.createObjectURL(blob);

    this.setState({
      cropModalVisible: false,
      imageSrc: this.imagePreviewURL,
      croppedBlob: blob,
      somethingChanged: true,
      submitOkMsgVisible: false,
    });
  };

  onBtnRemoveImage = () => {
    //
  };

  get eventPictureExists(): boolean {
    const { objectType } = this.props;
    const { logo, banner } = this.props.currentEvent.event!;

    return (
      (objectType === 'public-event-logo' && !!logo) ||
      (objectType === 'public-event-banner' && !!banner)
    );
  }

  handleRemoveConfirmModalClose = (confirmed?: boolean) => {
    this.setState({ removeConfirmModalVisible: false }, () => {
      if (confirmed) {
        let mediaType: Params<'removeEventMedia'>['mediaType'] = 'banner';

        switch (this.props.objectType) {
          case 'public-event-logo':
            mediaType = 'logo';
            break;
          case 'public-event-banner':
            mediaType = 'banner';
            break;
        }

        this.setState({ isSubmitting: true, submitErrorMsg: '' });
        this.uh
          .wrap(
            api.events.exec('removeEventMedia', {
              eventId: this.props.currentEvent.event!.id,
              mediaType,
              __delay: 333,
              __genErr: false,
            }),
          )
          .then(({ err, results }) => {
            this.setState({ isSubmitting: false });
            if (err) {
              this.setState({
                submitErrorMsg: `Ошибка удаления картинки: ${err.message}`,
              });
            } else {
              const { event } = results;
              this.props.currentEventActions.eventInfoLoaded(event);
              this.setState({ imageSrc: this.defaultImageSrc });
            }
          });
      }
    });
  };

  render() {
    const {
      isSubmitting,
      loadImageErrorMsg,
      imageSrc,
      cropSrc,
      cropModalVisible,
      submitErrorMsg,
      somethingChanged,
      submitOkMsgVisible,
      newImageIsPng,
      removeConfirmModalVisible,
    } = this.state;

    const { title, subtitle, cropAspectRatio, objectType } = this.props;
    const isLogo = objectType === 'public-event-logo';
    const showRemoveButton = this.eventPictureExists && !this.state.croppedBlob;

    return (
      <>
        <ConfirmModal
          visible={removeConfirmModalVisible}
          handleClose={this.handleRemoveConfirmModalClose}
          okBtnClass={'is-danger'}
          okBtnText="Удалить"
        >
          Удалить картинку мероприятия?
        </ConfirmModal>
        <ImageCropper
          aspect={cropAspectRatio}
          circular={false}
          src={cropSrc}
          visible={cropModalVisible}
          handleCancel={() => this.setState({ cropModalVisible: false })}
          handleOk={this.handleCropResult}
          png={newImageIsPng}
        />
        <div className="container">
          <div className="columns">
            <div
              className={classNames('column', {
                'is-12': !isLogo,
                'is-10-tablet is-8-desktop': isLogo,
              })}
            >
              <div className="box">
                <>
                  {/* --- Заголовок -------------------------  */}

                  <h3 className="title is-5 has-text-grey">{title}</h3>
                  <h4 className="subtitle is-6 has-text-grey-light">
                    {subtitle}
                  </h4>

                  {/* --- Картинка -------------------------  */}

                  {imageSrc && (
                    <div
                      data-tooltip="Выбрать картинку"
                      className={classNames(
                        'has-tooltip-bottom has-tooltip-arrow',
                        {
                          'event-logo-preview-outer': isLogo,
                        },
                      )}
                    >
                      <figure className="image">
                        <img
                          className=""
                          ref={this.imgRef}
                          src={imageSrc}
                          alt=""
                          onClick={() =>
                            !isSubmitting &&
                            this.fileInputRef.current &&
                            this.fileInputRef.current.click()
                          }
                        />
                      </figure>
                    </div>
                  )}

                  {!imageSrc && (
                    <p className="has-text-grey-lighter is-size-7">
                      Картинки пока нет
                    </p>
                  )}

                  {/* --- Ошибка при загрузке из файла ---------------------  */}

                  {loadImageErrorMsg && (
                    <div className="mt-4">
                      <Alert
                        type={'warning'}
                        onClose={() => this.setState({ loadImageErrorMsg: '' })}
                      >
                        {loadImageErrorMsg}
                      </Alert>
                    </div>
                  )}

                  {/* --- Файл-инпут (и удаляшка) ---------------------  */}

                  <div className="flex-row-left">
                    <div className="file mt-4">
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
                    {showRemoveButton && (
                      <div className="ml-3 mt-4">
                        <button
                          className={classNames('button is-warning', {
                            'is-loading': isSubmitting,
                          })}
                          type="button"
                          onClick={() =>
                            this.setState({ removeConfirmModalVisible: true })
                          }
                          disabled={isSubmitting}
                        >
                          Удалить...
                        </button>
                      </div>
                    )}
                  </div>

                  {/* --- Ошибка сохранения ----------------------------------------*/}

                  {submitErrorMsg && (
                    <div className="field mt-4">
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
                    <div className="field mt-4">
                      <Alert
                        type={'success'}
                        onClose={() =>
                          this.setState({ submitOkMsgVisible: false })
                        }
                      >
                        Сохранено
                      </Alert>
                    </div>
                  )}

                  {/* ---- Сохранить и Отменить --------------------- */}

                  {somethingChanged && !submitOkMsgVisible && (
                    <div className="field is-grouped mt-4">
                      <p className="control">
                        <button
                          type="button"
                          className={classNames(`button is-primary`, {
                            'is-loading': isSubmitting,
                          })}
                          disabled={isSubmitting}
                          onClick={this.onSubmit}
                        >
                          Сохранить
                        </button>
                      </p>
                      <p className="control">
                        <button
                          type="button"
                          className="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            this.setState(
                              {
                                somethingChanged: false,
                                submitErrorMsg: '',
                                imageSrc: this.defaultImageSrc,
                                croppedBlob: null,
                              },
                              () => {
                                if (this.imagePreviewURL) {
                                  URL.revokeObjectURL(this.imagePreviewURL);
                                  this.imagePreviewURL = '';
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
                </>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventImage);
