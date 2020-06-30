import React from 'react';

export type ConfirmModalProps = React.PropsWithChildren<{
  visible: boolean;
  title?: string;
  handleClose: (confirmed?: boolean) => void;
  okBtnClass?: string;
  okBtnText?: string;
  cancelBtnText?: string;
}>;

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  handleClose,
  children,
  okBtnClass,
  okBtnText,
  cancelBtnText,
}: ConfirmModalProps) => {
  return (
    <div className={`modal ${visible ? 'is-active' : ''}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title has-text-grey has-text-weight-bold">
            {title || 'Подтвердите действие'}
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={() => handleClose(false)}
          />
        </header>
        <section className="modal-card-body">{children}</section>
        <footer className="modal-card-foot">
          <button
            className={`button ${okBtnClass || 'is-primary'}`}
            onClick={() => handleClose(true)}
          >
            {okBtnText || 'OK'}
          </button>
          <button className="button" onClick={() => handleClose(false)}>
            {cancelBtnText || 'Отмена'}
          </button>
        </footer>
      </div>
    </div>
  );
};
