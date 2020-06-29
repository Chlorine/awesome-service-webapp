import loadImage from 'blueimp-load-image';

export type LoadImageFromFileResult = {
  isPng: boolean;
  dataURL: string;
};

export const loadImageFromFile = async (
  file: File,
): Promise<LoadImageFromFileResult> => {
  const isPng = file.type === 'image/png';

  // https://github.com/blueimp/JavaScript-Load-Image/#image-loading

  return new Promise<LoadImageFromFileResult>((resolve, reject) => {
    loadImage(
      file,
      maybeImg => {
        if ('type' in maybeImg && maybeImg.type === 'error') {
          reject(new Error('Ошибка загрузки картинки из файла'));
        } else {
          resolve({
            isPng,
            dataURL: (maybeImg as HTMLCanvasElement).toDataURL(
              isPng ? 'image/png' : 'image/jpeg',
            ),
          });
        }
      },
      { orientation: true, canvas: true },
    );
  });
};
