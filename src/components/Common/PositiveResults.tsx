import React from 'react';

export const PositiveResults: React.FC<{ children?: any }> = props => {
  return (
    <article className="media">
      <div className="media-left">
        <span className="icon is-large">
          <i className="fa fa-check-circle has-text-success fa-2x" />
        </span>
      </div>
      <div className="media-content">{props.children}</div>
    </article>
  );
};
