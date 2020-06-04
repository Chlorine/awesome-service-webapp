import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { truncate } from 'lodash';

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
  msgPrefix?: string;
  onClose?: () => void;
}> = ({ msg, onClose, msgPrefix }) => {
  if (!msg) return null;

  return (
    <div className="columns">
      <div className="column is-12">
        <Alert type="danger" onClose={onClose}>
          {msgPrefix || 'Не удалось загрузить данные'}: {msg}
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
  textClass?: string;
}> = ({ title, linkTo, textClass }) => {
  return (
    <h3 className={`title ve-page-title is-5 ${textClass || 'has-text-grey'}`}>
      {linkTo ? <Link to={linkTo}>{title}</Link> : title}
    </h3>
  );
};

export const VEDescriptionAsSubtitle: React.FC<{
  descr?: string | null;
  truncateTo?: number;
  stub?: string;
}> = ({ descr, truncateTo, stub }) => {
  return (
    <p className="subtitle is-6">
      {descr && truncate(descr, { length: truncateTo || 160 })}
      {!descr && (
        <span className="has-text-grey-lighter">{stub || 'Без описания'}</span>
      )}
    </p>
  );
};
