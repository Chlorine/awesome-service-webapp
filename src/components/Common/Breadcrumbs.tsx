import React from 'react';
import { truncate } from 'lodash';
import { Link } from 'react-router-dom';

import './Breadcrumb.scss';

export type BreadcrumbItem = {
  title: string;
  linkTo: string;
};

export const Breadcrumbs: React.FC<{
  items: BreadcrumbItem[];
  current?: string | null;
  currentMaxLength?: number;
}> = ({ items, current, currentMaxLength }) => {
  return (
    <nav className="breadcrumb awesome-breadcrumb" aria-label="breadcrumbs">
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Link to={item.linkTo}>{item.title}</Link>
          </li>
        ))}

        {current && (
          <li className="is-active">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" aria-current="page">
              {currentMaxLength
                ? truncate(current, { length: currentMaxLength })
                : current}
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};
