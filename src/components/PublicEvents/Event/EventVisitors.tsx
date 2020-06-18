import React from 'react';
import { Dispatch } from 'redux';
import { format, parseISO } from 'date-fns';
import RU from 'date-fns/locale/ru';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import classNames from 'classnames';
import Highlighter from 'react-highlight-words';

import { RootState } from '../../../store';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';
import { EventVisitorInfo } from '../../../back/common/public-events/visitor';
import { Alert } from '../../Common/Alert';
import {
  getSavedPageSize,
  PaginationControls,
  PaginationState,
} from '../../Common/Pagination';

import { Params as EventApiParams } from '../../../back/common/public-events/api';
import { Utils } from '../../../utils/utils';

const mapStateToProps = (state: RootState) => {
  return {
    router: state.router,
    currentEvent: state.currentEvent,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps;

declare type SortOrder = Required<
  EventApiParams<'getEventVisitors'>
>['sortOrder'];

const SORT_ORDERS: SortOrder[] = [
  'reg-timestamp-asc',
  'reg-timestamp-desc',
  'last-name-asc',
  'last-name-desc',
];

const SORT_ORDER_NAMES: { [key in SortOrder]: string } = {
  'reg-timestamp-asc': 'От старых к новым',
  'reg-timestamp-desc': 'От новых к старым',
  'last-name-asc': 'Фамилия (а-я)',
  'last-name-desc': 'Фамилия (я-а)',
};

const MIN_SUBSTR_LENGTH = 3;

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  substring: string;
  lastUsedSubstr: string | undefined;
  sortOrder: SortOrder;
  visitors: EventVisitorInfo[];
} & PaginationState;

const PG_VIEW_NAME = 'event_visitors';

export function visitorSourceType2Str(
  source: EventVisitorInfo['sourceType'],
): string {
  let res = source || '';

  switch (source) {
    case 'widget':
      res = 'виджет';
      break;
    case 'external':
      res = 'импорт';
      break;
  }

  return _.upperFirst(res);
}

function getSavedSortOrder(): SortOrder {
  let sortOrder = Utils.localStorageGet(`${PG_VIEW_NAME}_sortOrder`);
  if (!SORT_ORDERS.includes(sortOrder)) {
    sortOrder = SORT_ORDERS[0];
  }

  return sortOrder;
}

class EventVisitors extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    errorMsg: '',
    visitors: [],
    substring: '',
    lastUsedSubstr: undefined,
    sortOrder: getSavedSortOrder(),
    // pagination:
    pageSize: getSavedPageSize(PG_VIEW_NAME),
  };

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Список посетителей';

    this.goToPage(1);
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  goToPage = (page: number) => {
    const eventId = this.props.currentEvent.event?.id || 'invalid_event_id';
    const { pageSize, substring, sortOrder } = this.state;

    this.setState({ isFetching: true, errorMsg: '' });

    let searchSubstring: string | undefined;
    if (substring.length >= MIN_SUBSTR_LENGTH) {
      searchSubstring = substring;
    }

    this.uh
      .wrap(
        api.events.exec('getEventVisitors', {
          eventId,
          limit: pageSize,
          offset: pageSize * (page - 1),
          substring: searchSubstring,
          sortOrder,
          __delay: 33,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ errorMsg: err.message });
        } else {
          const { visitors } = results;
          this.setState({
            visitors,
            pgRes: results,
            lastUsedSubstr: searchSubstring,
          });
        }
      });
  };

  _onSubstringChanged = () => {
    const { substring, lastUsedSubstr } = this.state;

    if (substring.length >= MIN_SUBSTR_LENGTH || !!lastUsedSubstr) {
      this.goToPage(1);
    }
  };

  private throttledOnSubStrChanged = _.throttle(this._onSubstringChanged, 400);
  private debouncedOnSubStrChanged = _.debounce(this._onSubstringChanged, 600, {
    leading: false,
  });

  handleSubstringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ substring: e.currentTarget.value.trimStart() }, () => {
      if (this.state.substring.length < 5) {
        this.throttledOnSubStrChanged();
      } else {
        this.debouncedOnSubStrChanged();
      }
    });
  };

  handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortOrder = e.currentTarget.value as SortOrder;
    this.setState({ sortOrder }, () => {
      Utils.localStorageSet(`${PG_VIEW_NAME}_sortOrder`, sortOrder);
      this.goToPage(1);
    });
  };

  renderToolbar() {
    const { isFetching, substring, sortOrder } = this.state;

    return (
      <div className="box py-3">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <div
                className={classNames('control has-icons-left', {
                  'is-loading': isFetching,
                })}
              >
                <input
                  className="input"
                  type="text"
                  placeholder="Поиск (от 3 символов)"
                  value={substring}
                  maxLength={24}
                  onChange={this.handleSubstringChange}
                />
                <span className="icon is-left">
                  <i className="fa fa-search" />
                </span>
                <span className="icon">
                  <i
                    className={classNames('fa fa-check', {
                      'has-text-grey-lighter':
                        substring.length < MIN_SUBSTR_LENGTH,
                      'has-text-success': substring.length >= MIN_SUBSTR_LENGTH,
                    })}
                  />
                </span>
              </div>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <div className="control has-icons-left">
                <div className="select">
                  <select
                    disabled={isFetching}
                    value={sortOrder}
                    onChange={this.handleSortOrderChange}
                  >
                    {SORT_ORDERS.map((so, index) => (
                      <option key={index} value={so}>
                        {SORT_ORDER_NAMES[so]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="icon is-small is-left">
                  <i className="fa fa-sort" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      isFetching,
      errorMsg,
      visitors,
      pgRes,
      pageSize,
      substring,
    } = this.state;

    return (
      <div className="container">
        <div className="columns">
          <div className="column is-12">
            {!pgRes && isFetching && (
              <div className="flex-row-centered has-text-grey-light has-text-weight-bold">
                <span className="loader is-loading mr-3" /> Загрузка...
              </div>
            )}
            {pgRes && this.renderToolbar()}
            {errorMsg && (
              <Alert type="danger">
                Не удалось загрузить посетителей: {errorMsg}
              </Alert>
            )}
            {!isFetching && !errorMsg && visitors.length === 0 && (
              <div className="has-text-centered has-text-grey mt-6">
                Посетителей не найдено
              </div>
            )}
            {visitors.length > 0 && (
              <>
                <ul className="list mb-5">
                  {visitors.map(v => (
                    <VisitorListItem
                      key={v.id}
                      visitor={v}
                      currSearchSubstr={substring}
                    />
                  ))}
                </ul>
                <PaginationControls
                  pgViewName={PG_VIEW_NAME}
                  pgRes={pgRes}
                  isFetching={isFetching}
                  goToPage={this.goToPage}
                  pageSize={pageSize}
                  handlePageSizeChange={newPageSize => {
                    this.setState({ pageSize: newPageSize }, () => {
                      this.goToPage(1);
                    });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventVisitors);

const VisitorListItem: React.FC<{
  visitor: EventVisitorInfo;
  currSearchSubstr: string;
}> = ({ visitor, currSearchSubstr }) => {
  const {
    lastName,
    firstName,
    middleName,
    companyName,
    position,
    phone,
    email,
    regTimestamp,
    sourceType,
  } = visitor;

  const searchWords = currSearchSubstr.length > 2 ? [currSearchSubstr] : []; // currSearchSubstr.split(' ');

  return (
    <li className="list-item px-2 py-0" style={{ opacity: 1 }}>
      {/* --- Данные посетителя ----- */}

      <div className="columns is-marginless">
        <div className="column is-4 pb-1">
          {/* --- ФИО ------------------------- */}

          <div className="has-text-weight-bold text-truncate has-text-link">
            <Link to={`/public-event-visitor/${visitor.id}`}>
              <Highlighter
                autoEscape={true}
                searchWords={searchWords}
                textToHighlight={lastName}
              />
            </Link>
          </div>

          <div className="text-truncate">
            <Highlighter
              autoEscape={true}
              searchWords={searchWords}
              textToHighlight={firstName + ' ' + middleName}
            />
          </div>
        </div>
        <div className="column is-4 pb-1">
          {/* --- Компания и должность ------------------------- */}

          <div className="has-text-weight-bold has-text-grey text-truncate">
            <Highlighter
              autoEscape={true}
              searchWords={searchWords}
              textToHighlight={companyName}
            />
          </div>

          <div className="text-truncate">
            <Highlighter
              autoEscape={true}
              searchWords={searchWords}
              textToHighlight={position}
            />
          </div>
        </div>
        <div className="column is-4 pb-1">
          {/* --- Контакты ------------------------- */}

          <div className="text-truncate">
            <span className="icon has-text-grey-light">
              <i className="fa fa-envelope" />
            </span>{' '}
            {email && (
              <span>
                <a className="has-text-link" href={`mailto:${email}`}>
                  <Highlighter
                    autoEscape={true}
                    searchWords={searchWords}
                    textToHighlight={email}
                  />
                </a>
              </span>
            )}
            {!email && (
              <span className="has-text-grey-lighter">Нет данных</span>
            )}
          </div>
          <div className="text-truncate">
            <span className="icon has-text-grey-light">
              <i className="fa fa-phone" />
            </span>{' '}
            {phone && (
              <span>
                <a className="has-text-link" href={`tel:${phone}`}>
                  <Highlighter
                    autoEscape={true}
                    searchWords={searchWords}
                    textToHighlight={phone}
                  />
                </a>
              </span>
            )}
            {!phone && (
              <span className="has-text-grey-lighter">Нет данных</span>
            )}
          </div>
        </div>
      </div>

      {/* --- Всякое служебное ------------------------- */}

      <div className="columns is-marginless pt-0">
        <div className="column is-12 pt-0">
          <div className="is-size-7">
            <span className="tag">
              Зарегистр.{' '}
              {format(parseISO(regTimestamp), 'd MMMM yyyy в HH:mm', {
                locale: RU,
              })}
            </span>
            <span className="tag is-info is-light ml-2">
              {' '}
              {visitorSourceType2Str(sourceType)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
};
