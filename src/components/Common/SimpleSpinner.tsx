import React from 'react';

export const SimpleSpinner: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="level is-mobile">
      <div className="level-left">
        <div className="level-item">
          <span className="loader is-loading" />
        </div>
        <div className="level-item has-text-grey-light has-text-weight-bold">
          {text || 'Пожалуйста, подождите...'}
        </div>
      </div>
    </div>
  );
};
