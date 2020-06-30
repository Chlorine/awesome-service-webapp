import React from 'react';
import { Link } from 'react-router-dom';
import { truncate } from 'lodash';

import { PublicEventInfo } from '../../back/common/public-events/event';

import api from '../../back/server-api';

import { formatEventDates } from '../../utils/format-event-date';
import { UnmountHelper } from '../../utils/unmount-helper';
import {
  VEDescriptionAsSubtitle,
  VEPageSecondaryTitle,
} from '../Common/ViewElements';
import {
  getSavedPageSize,
  PaginationControls,
  PaginationState,
} from '../Common/Pagination';
import { Alert } from '../Common/Alert';

import DEFAULT_EVENT_LOGO from './../../images/public-event-02.svg';

declare type Props = {
  isArchive: boolean;
};

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  events: PublicEventInfo[];
} & PaginationState;

export default class Events extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State;
  docTitle: string;
  pgViewName: string;

  constructor(props: Props, context?: any) {
    super(props, context);

    const { isArchive } = props;

    this.docTitle = isArchive ? 'Актуальные мероприятия' : 'Архив мероприятий';
    this.pgViewName = isArchive ? 'events_archive' : 'events_actual';

    this.state = {
      isFetching: true,
      errorMsg: '',
      events: [],
      // pagination:
      pageSize: getSavedPageSize(this.pgViewName),
    };
  }

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Актуальные мероприятия';

    this.goToPage(1);
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  goToPage = (page: number) => {
    const { pageSize } = this.state;

    this.setState({ isFetching: true, errorMsg: '' });

    this.uh
      .wrap(
        api.events.exec('getEvents', {
          limit: pageSize,
          offset: pageSize * (page - 1),
          fromArchive: this.props.isArchive,
          __delay: 33,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ errorMsg: err.message });
        } else {
          const { events } = results;
          this.setState({ events, pgRes: results });
        }
      });
  };

  render() {
    const { isFetching, errorMsg, events, pgRes, pageSize } = this.state;
    const { isArchive } = this.props;

    return (
      <div className="container">
        <div className="columns">
          <div className="column is-12">
            {!pgRes && isFetching && (
              <div className="flex-row-centered has-text-grey-light has-text-weight-bold">
                <span className="loader is-loading mr-3" /> Загрузка...
              </div>
            )}
            {errorMsg && (
              <Alert type="danger">
                Не удалось загрузить мероприятия: {errorMsg}
              </Alert>
            )}
            {!isFetching && !errorMsg && events.length === 0 && (
              <div className="has-text-centered has-text-grey">
                <p className="has-text-grey">
                  {isArchive ? 'Нет мероприятий' : 'Мероприятий еще нет'}
                </p>
                <br />
                {!isArchive && (
                  <Link
                    className="button is-primary is-outlined"
                    to="/public-events/new"
                  >
                    Создать
                  </Link>
                )}
              </div>
            )}
            {events.length > 0 && (
              <>
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
                <PaginationControls
                  pgViewName={this.pgViewName}
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

const EventCard: React.FC<{ event: PublicEventInfo }> = ({ event }) => {
  const { logo } = event;

  return (
    <div className="box">
      <div className="media">
        <div className="media-left">
          {logo && (
            <figure className="image is-64x64">
              <img src={logo} alt="" />
            </figure>
          )}
          {!logo && (
            <figure className="image is-64x64">
              {/*<i className="fa fa-4x fa-star-o has-text-grey-light" />*/}
              <img src={DEFAULT_EVENT_LOGO} alt="" />
            </figure>
          )}
        </div>
        <div className="media-content zero-min-width">
          <VEPageSecondaryTitle
            title={event.name}
            linkTo={`/public-event/${event.id}`}
          />
          <VEDescriptionAsSubtitle descr={event.description} />
          <p className="has-text-grey has-text-weight-bold">
            <span className="icon">
              <i className="fa fa-calendar" />
            </span>{' '}
            {formatEventDates(event.start, event.end)}
          </p>
          {/* --- Место проведения ----*/}
          <p className="has-text-grey">
            <span className="icon">
              <i className="fa fa-map-marker" />
            </span>{' '}
            {truncate(event.place.name, { length: 100 })}
          </p>
        </div>
      </div>
    </div>
  );
};
