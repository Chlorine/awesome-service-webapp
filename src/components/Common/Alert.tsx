import React from 'react';

export const Alert: React.FC<{
  type: 'danger' | 'warning' | 'success';
  onClose?: () => void;
}> = ({ type, onClose, children }) => {
  return (
    <div className={`notification is-${type} is-light`}>
      {onClose && <button className="delete" onClick={onClose} />}
      {children}
    </div>
  );
};
