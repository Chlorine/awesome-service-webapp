import React from 'react';
import { Link } from 'react-router-dom';
import { truncate } from 'lodash';

import { SimpleSpinner } from '../Common/SimpleSpinner';
import { PublicEventInfo } from '../../back/common/public-events/event';

import api from '../../back/server-api';

import { formatEventDates } from '../../utils/format-event-date';
import { UnmountHelper } from '../../utils/unmount-helper';
import {
  VEDescriptionAsSubtitle,
  VEPageSecondaryTitle,
} from '../Common/ViewElements';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  events: PublicEventInfo[];
};

export default class EventsActual extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: true,
    errorMsg: '',
    events: [],
  };

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Актуальные мероприятия';

    this.setState({ isFetching: true });
    this.uh
      .wrap(
        api.events.exec('getEvents', {
          __delay: 0,
          __genErr: false,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ errorMsg: err.message });
        } else {
          const { events } = results;
          this.setState({ events });
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  render() {
    const { isFetching, errorMsg, events } = this.state;

    return (
      <div className="container">
        {isFetching && (
          <div className="columns">
            <div className="column is-12">
              <SimpleSpinner text="Загрузка..." />
            </div>
          </div>
        )}
        {errorMsg && (
          <div className="columns">
            <div className="column is-12">
              <div className="notification is-danger is-light">
                Не удалось загрузить мероприятия: {errorMsg}
              </div>
            </div>
          </div>
        )}
        {!isFetching && !errorMsg && (
          <div className="columns">
            {events.length === 0 && (
              <div className="column is-12 has-text-centered">
                <p>Мероприятий нет</p>
                <br />
                <Link
                  className="button is-primary is-outlined"
                  to="/public-events/new"
                >
                  Создать
                </Link>
              </div>
            )}
            {events.length !== 0 && (
              <div className="column is-12">
                {events.map(event => (
                  <div key={event.id} className="box">
                    <div className="media">
                      <div className="media-left">
                        <span className="icon is-large">
                          <i className="fa fa-2x fa-star-o has-text-grey-light" />
                        </span>
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
