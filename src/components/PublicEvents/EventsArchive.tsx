import React from 'react';

import { SimpleSpinner } from '../Common/SimpleSpinner';

import { PublicEventInfo } from '../../back/common/public-events/event';

import api from '../../back/server-api';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  events: PublicEventInfo[];
};

export default class EventsArchive extends React.Component<Props, State> {
  state: State = {
    isFetching: true,
    errorMsg: '',
    events: [],
  };

  componentDidMount(): void {
    document.title = 'Архив мероприятий';

    this.setState({ isFetching: true });

    api.events
      .exec('getEvents', { __delay: 0, __genErr: false })
      .then(({ events }) => this.setState({ events }))
      .catch(err => this.setState({ errorMsg: err.message }))
      .then(() => this.setState({ isFetching: false }));
  }

  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            <div className="column is-12">
              <div className="box">
                <h3 className="title is-5 has-text-grey-light">
                  Архив мероприятий (прошедшие, etc.)
                </h3>
                <h4 className="subtitle is-6 has-text-grey-lighter">
                  Coming soon{' '}
                  <span className="icon">
                    <i className="fa fa-smile-o" />
                  </span>{' '}
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
