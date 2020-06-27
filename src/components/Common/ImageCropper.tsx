import React from 'react';
import ReactCrop, { Crop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export type Props = {
  src: any;
  visible: boolean;
  handleCancel: () => void;
  handleOk: (blob: Blob) => void;
  aspect: number;
  circular?: boolean;
};

declare type State = {
  crop: ReactCrop.Crop;
  isWorking: boolean;
};

export default class ImageCropper extends React.Component<Props, State> {
  state: State;
  imgElem: any = null;

  constructor(props: Props, context?: any) {
    super(props, context);

    this.state = {
      crop: {
        unit: '%',
        aspect: props.aspect,
      },
      isWorking: false,
    };
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any,
  ): void {
    if (this.props.visible && this.props.visible !== prevProps.visible) {
      // this.loadInfo().catch(err => console.error);
    }
  }

  onImageLoaded = (img: HTMLImageElement): boolean | undefined => {
    this.imgElem = img;

    const crop: ReactCrop.Crop = {
      unit: '%',
      aspect: this.props.aspect,
    };

    if (img.naturalWidth >= img.naturalHeight) {
      crop.height = 100;
    } else {
      crop.width = 100;
    }

    this.setState({
      crop,
    });

    return false;
  };

  onCropComplete = (crop: Crop, percentCrop: PercentCrop) => {
    // console.log('onCropComplete', crop, percentCrop);
  };

  onCropChange = (crop: Crop, percentCrop: PercentCrop) => {
    //console.log('onCropChange', crop, percentCrop);
    this.setState({ crop: crop });
  };

  handleOk = () => {
    const { crop } = this.state;

    if (this.imgElem && crop.width && crop.height) {
      this.setState({ isWorking: true });

      let blob: Blob | null = null;
      this.getCroppedImg(this.imgElem, crop)
        .then(res => (blob = res))
        .catch(console.error)
        .then(() => {
          this.setState({ isWorking: false });
          if (blob) {
            this.props.handleOk(blob);
          }
        });
    }
  };

  handleCancel = () => {
    if (!this.state.isWorking) {
      this.props.handleCancel();
    }
  };

  render() {
    const { visible, src } = this.props;
    const { isWorking } = this.state;

    return (
      <div className={`modal ${visible ? 'is-active' : ''}`}>
        <div className="modal-background" />
        <div className="modal-content">
          {src && (
            <ReactCrop
              src={src}
              crop={this.state.crop}
              ruleOfThirds={false}
              circularCrop={this.props.circular}
              onImageLoaded={this.onImageLoaded}
              onComplete={this.onCropComplete}
              onChange={this.onCropChange}
              keepSelection={true}
              disabled={isWorking}
              minWidth={32}
              minHeight={32}
            />
          )}

          <div className="flex-row-centered mt-3">
            <div className="mr-3">
              <button
                type="button"
                className={`button is-primary ${isWorking ? 'is-loading' : ''}`}
                onClick={this.handleOk}
                disabled={isWorking}
              >
                OK
              </button>
            </div>
            <div className="mr-3">
              <button
                type="button"
                className="button"
                onClick={this.handleCancel}
                disabled={isWorking}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
        <button
          className="modal-close is-large"
          aria-label="close"
          onClick={this.handleCancel}
        />
      </div>
    );
  }

  async getCroppedImg(
    image: HTMLImageElement,
    crop: ReactCrop.Crop,
  ): Promise<Blob> {
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const { x, y, width, height } = crop as Required<ReactCrop.Crop>;

    const canvas = document.createElement('canvas');
    canvas.width = width * scaleX;
    canvas.height = height * scaleY;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      image,
      x * scaleX,
      y * scaleY,
      width * scaleX,
      height * scaleY,
      0,
      0,
      width * scaleX,
      height * scaleY,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.7,
      );
    });
  }
}
