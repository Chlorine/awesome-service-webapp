import React from 'react';

import { PaginationResults } from '../../back/common';
import { SimpleSpinner } from './SimpleSpinner';
import { Utils } from '../../utils/utils';

export type PaginationState = {
  pgRes?: PaginationResults;
  pageSize: number;
};

export const VALID_PAGE_SIZES = [5, 10, 15, 20, 30, 40, 50];

export type PaginationControlsProps = {
  pgViewName: string;
  isFetching: boolean;
  pgRes?: PaginationResults;
  goToPage: (page: number) => void;
  pageSize: number;
  handlePageSizeChange: (pageSize: number) => void;
};

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pgViewName,
  isFetching,
  pgRes,
  goToPage,
  pageSize,
  handlePageSizeChange,
}) => {
  if (!pgRes || !pgRes.page || pgRes.totalDocs < VALID_PAGE_SIZES[0])
    return null;

  const {
    hasNextPage,
    hasPrevPage,
    page,
    totalPages,
    prevPage,
    nextPage,
  } = pgRes;

  return (
    <>
      {/* --- Текущая страничка для мобилки ------------------ */}

      <div className="is-hidden-tablet mb-2">
        <CurrentPageInfo page={page} totalPages={totalPages} />
      </div>
      <div className="flex-row-left">
        {/* --- Переход на первую ------------------ */}

        <div className="mr-2">
          <button
            type="button"
            className="button is-small--"
            disabled={page === 1 || isFetching}
            onClick={() => goToPage(1)}
          >
            <span className="icon">
              <i className="fa fa-angle-double-left" />
            </span>
          </button>
        </div>

        {/* --- На предыдущую ------------------ */}

        <div className="mr-2">
          <button
            type="button"
            className="button is-small---"
            disabled={!hasPrevPage || isFetching}
            onClick={() => goToPage(prevPage || 1)}
          >
            <span className="icon">
              <i className="fa fa-angle-left" />
            </span>
          </button>
        </div>

        {/* --- Текущая страничка ------------------ */}

        <div className="ml-2 mr-4 is-hidden-mobile">
          <CurrentPageInfo page={page} totalPages={totalPages} />
        </div>

        {/* --- На следующую ------------------ */}

        <div className="mr-2">
          <button
            type="button"
            className="button is-small--"
            disabled={!hasNextPage || isFetching}
            onClick={() => goToPage(nextPage || 1)}
          >
            <span className="icon">
              <i className="fa fa-angle-right" />
            </span>
          </button>
        </div>

        {/* --- На последнюю ------------------ */}

        <div className="mr-2">
          <button
            type="button"
            className="button is-small---"
            disabled={page === totalPages || isFetching}
            onClick={() => goToPage(totalPages)}
          >
            <span className="icon">
              <i className="fa fa-angle-double-right" />
            </span>
          </button>
        </div>

        {/* --- Кол-во итемов на страницу --------------- */}

        <div className="is-hidden-touch">
          <PageSizeSelect
            isFetching={isFetching}
            pageSize={pageSize}
            pgViewName={pgViewName}
            handlePageSizeChange={handlePageSizeChange}
          />
        </div>

        {/* --- Крутилка ------------------ */}

        <div className="mr-3" />
        {isFetching && <SimpleSpinner text=" " />}
      </div>

      {/* --- Кол-во итемов на страницу для мобилки --------------- */}

      <div className="is-hidden-desktop mt-2">
        <PageSizeSelect
          isFetching={isFetching}
          pageSize={pageSize}
          pgViewName={pgViewName}
          handlePageSizeChange={handlePageSizeChange}
        />
      </div>
    </>
  );
};

export const getSavedPageSize = (pgViewName: string): number => {
  let pageSize = parseInt(Utils.localStorageGet(`${pgViewName}_pageSize`));
  if (isNaN(pageSize) || !VALID_PAGE_SIZES.includes(pageSize)) {
    pageSize = 10;
  }

  return pageSize;
};

export const savePageSize = (pgViewName: string, pageSize: number): void => {
  Utils.localStorageSet(`${pgViewName}_pageSize`, pageSize);
};

const CurrentPageInfo: React.FC<{ page: number; totalPages: number }> = ({
  page,
  totalPages,
}) => (
  <span className="has-text-weight-bold has-text-grey is-size-7---">
    Стр. {page} из {totalPages}
  </span>
);

const PageSizeSelect: React.FC<{
  isFetching: boolean;
  pageSize: number;
  pgViewName: string;
  handlePageSizeChange: PaginationControlsProps['handlePageSizeChange'];
}> = ({ isFetching, pageSize, pgViewName, handlePageSizeChange }) => {
  return (
    <div className="control has-icons-left">
      <div className="select">
        <select
          disabled={isFetching}
          value={pageSize}
          onChange={e => {
            const pageSize = parseInt(e.currentTarget.value);
            savePageSize(pgViewName, pageSize);
            handlePageSizeChange(pageSize);
          }}
        >
          {VALID_PAGE_SIZES.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="icon is-small is-left">
        <i className="fa fa-list-ul" />
      </div>
    </div>
  );
};
