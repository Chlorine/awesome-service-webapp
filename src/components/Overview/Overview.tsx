import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import api from '../../back/server-api';

import { SummaryEventsInfo } from '../../back/common/public-events';
import produce from 'immer';
import { Pluralize, Words } from '../../utils/pluralize-ru';
import { Link } from 'react-router-dom';
import { UnmountHelper } from '../../utils/unmount-helper';
import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageTitle,
} from '../Common/ViewElements';
import { RootState } from '../../store';

const mapStateToProps = (state: RootState) => {
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
  uh = new UnmountHelper();

  state: State = {
    isFetching: true,
    errorMsg: '',
    summary: {},
  };

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Мои сервисы';

    this.setState({ isFetching: true, errorMsg: '' });

    this.uh
      .wrap(Promise.all([api.events.exec('getSummary', {})]))
      .then(({ err, results }) => {
        this.setState(
          produce((prevState: State) => {
            prevState.isFetching = false;
            if (err) {
              prevState.errorMsg = err.message;
            } else {
              prevState.summary.events = results[0].summary;
            }
          }),
        );
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  render() {
    const { isFetching, errorMsg, summary } = this.state;

    const { events } = summary;

    return (
      <section className="hero is-white">
        <div className="hero-body">
          {/* --- Титле ---------------------------- */}

          <div className="container">
            <VEPageTitle title="Мои сервисы" />
            <br />
            <VEFetchingSpinner isFetching={isFetching} />
            <VEFetchError msg={errorMsg} />

            {/* --- Мероприятия -------------------*/}
            {!isFetching && !!events && (
              <>
                <h4 className="subtitle is-5">Мероприятия</h4>
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
                      <Link className="has-text-link" to={'/public-events'}>
                        Управлять мероприятиями
                      </Link>
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
