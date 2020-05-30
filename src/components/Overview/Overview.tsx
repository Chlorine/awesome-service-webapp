import React from 'react';
import { AppState } from '../../store/state';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import api from '../../back/server-api';
import { SummaryEventsInfo } from '../../back/common/public-events';
import produce from 'immer';
import { SimpleSpinner } from '../Common/SimpleSpinner';
import { Pluralize, Words } from '../../utils/pluralize-ru';
import { Link } from 'react-router-dom';

const mapStateToProps = (state: AppState) => {
  return {
    router: state.router,
    auth: state.auth,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  summary: {
    events?: SummaryEventsInfo;
  };
};

class Overview extends React.Component<Props, State> {
  state: State = {
    isFetching: true,
    errorMsg: '',
    summary: {},
  };

  componentDidMount(): void {
    document.title = 'Мои сервисы';

    this.setState({ isFetching: true });

    Promise.all([api.events.exec('getSummary', { __delay: 0 })])
      .then(results => {
        // results[0].summary.eventCount = 102;
        // results[0].summary.actualEventCount = 34;
        // results[0].summary.totalVisitors = 32051;
        this.setState(
          produce((prevState: State) => {
            prevState.summary.events = results[0].summary;
          }),
        );
      })
      .catch(err => this.setState({ errorMsg: err.message }))
      .then(() => this.setState({ isFetching: false }));
  }

  render() {
    // const { auth } = this.props;
    const { isFetching, errorMsg, summary } = this.state;

    const { events } = summary;

    return (
      <section className="hero is-white">
        <div className="hero-body">
          {/* --- Титле ---------------------------- */}
          <div className="container">
            <h3 className="title has-text-grey">Мои сервисы</h3>
            <br />
            {isFetching && !errorMsg && <SimpleSpinner text="Загрузка..." />}
            {!isFetching && errorMsg && (
              <div className="notification is-danger is-light">
                Не удалось загрузить сводку по сервисам: {errorMsg}
              </div>
            )}
            {/* --- Мероприятия -------------------*/}

            {!isFetching && !!events && (
              <>
                <h4 className="subtitle">Мероприятия</h4>
                <div className="columns">
                  <div className="column is-8-tablet is-7-desktop is-6-widescreen">
                    <div className="level box">
                      {/* --- Общее количество ---------------------------- */}
                      <div className="level-item has-text-centered">
                        <div>
                          <p className="title">{events.eventCount}</p>
                          <p className="heading">всего</p>
                        </div>
                      </div>
                      {/* --- Кол-во активных ---------------------------- */}
                      <div className="level-item has-text-centered">
                        <div>
                          <p className="title">{events.actualEventCount}</p>
                          <p className="heading">
                            {Pluralize.wordFrom(
                              events.actualEventCount,
                              Words.ActiveEvents,
                            )}
                          </p>
                        </div>
                      </div>
                      {/* --- Посетители ---------------------------- */}
                      <div className="level-item has-text-centered">
                        <div>
                          <p className="title">
                            {events.totalVisitors.toLocaleString('ru')}
                          </p>
                          <p className="heading">
                            {Pluralize.wordFrom(
                              events.totalVisitors,
                              Words.Visitors,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p>
                      <Link to={'/public-events'}>Управлять мероприятиями</Link>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
