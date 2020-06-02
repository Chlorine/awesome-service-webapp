import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { SimpleSpinner } from './SimpleSpinner';
import { Alert } from './Alert';

import './ViewElements.scss';

/**
 * Как бы про одинаковые штуки во всех вьюхах
 * Компоненты с префиксом VE 'View Element' в имени
 */

export const VEFetchingSpinner: React.FC<{
  isFetching: boolean;
  text?: string;
}> = ({ isFetching, text }) => {
  if (!isFetching) return null;

  return (
    <div className="columns">
      <div className="column is-12">
        <SimpleSpinner text={text || 'Загрузка...'} />
      </div>
    </div>
  );
};

export const VEFetchError: React.FC<{
  msg?: string | null;
  onClose?: () => void;
}> = ({ msg, onClose }) => {
  if (!msg) return null;

  return (
    <div className="columns">
      <div className="column is-12">
        <Alert type="danger" onClose={onClose}>
          Не удалось загрузить данные: {msg}
        </Alert>
      </div>
    </div>
  );
};

export const VEPageTitle: React.FC<{ title: string; isFetching?: boolean }> = ({
  title,
  isFetching,
}) => {
  return (
    <h3
      className={classNames('is-4 title ve-page-title', {
        'has-text-grey-lighter': isFetching,
        'has-text-grey': !isFetching,
      })}
    >
      {title}
    </h3>
  );
};

export const VEPageSecondaryTitle: React.FC<{
  title: string;
  linkTo?: string;
}> = ({ title, linkTo }) => {
  return (
    <h3 className="title ve-page-title is-5 has-text-grey">
      {linkTo ? <Link to={linkTo}>{title}</Link> : title}
    </h3>
  );
};
