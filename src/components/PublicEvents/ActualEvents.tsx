import React from 'react';

import { SimpleSpinner } from '../Common/SimpleSpinner';

import { PublicEventInfo } from '../../back/common/public-events/event';

import api from '../../back/server-api';
import { formatEventDates } from '../../utils/format-event-date';
import { Link } from 'react-router-dom';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  events: PublicEventInfo[];
};

export default class ActualEvents extends React.Component<Props, State> {
  state: State = {
    isFetching: true,
    errorMsg: '',
    events: [],
  };

  componentDidMount(): void {
    document.title = 'Актуальные мероприятия';

    this.setState({ isFetching: true });

    api.events
      .exec('getEvents', { __delay: 0, __genErr: false })
      .then(({ events }) => this.setState({ events }))
      .catch(err => this.setState({ errorMsg: err.message }))
      .then(() => this.setState({ isFetching: false }));
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
                Мероприятий нет
              </div>
            )}
            {events.length > 0 && (
              <div className="column is-12">
                {events.map(event => (
                  <div key={event.id} className="box">
                    <article className="media">
                      <div className="media-content">
                        <p className="title is-4 has-text-grey">
                          <Link to={`/public-event/${event.id}`}>
                            {event.name}
                          </Link>
                        </p>
                        <p className="subtitle is-6">{event.description}</p>
                        {/* --- Даты проведения ----*/}
                        <p className="has-text-grey has-text-weight-bold">
                          <span className="icon">
                            <i className="fa fa-calendar" />
                          </span>{' '}
                          {formatEventDates(event.start, event.end)}
                        </p>
                        {/* --- Место проведения ----*/}
                        <p className="has-text-grey-light has-text-weight-bold">
                          <span className="icon">
                            <i className="fa fa-map-marker" />
                          </span>{' '}
                          {event.place.name}
                        </p>
                      </div>
                    </article>
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
