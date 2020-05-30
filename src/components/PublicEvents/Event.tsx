import React from 'react';
import { Link, NavLink, Route, RouteComponentProps } from 'react-router-dom';
import classNames from 'classnames';
import { bindActionCreators, Dispatch } from 'redux';
import { Redirect, Switch } from 'react-router';
import { connect } from 'react-redux';

import { SimpleSpinner } from '../Common/SimpleSpinner';

import api from '../../back/server-api';
import { AppState } from '../../store/state';
import { Actions as CurrentEventActions } from '../../actions/current-event';

import EventEdit from './EventEdit';
import EventFastTrack from './EventFastTrack';
import EventWidget from './EventWidget';
import EventVisitorsInfo from './EventVisitorsInfo';
import EventInfo from './EventInfo';

const mapStateToProps = (state: AppState) => {
  return {
    router: state.router,
    currentEvent: state.currentEvent,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    currentEventActions: bindActionCreators(CurrentEventActions, dispatch),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<{ eventId?: string }>;

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
};

class Event extends React.Component<Props, State> {
  state: State = {
    isFetching: true,
    fetchErrorMsg: '',
  };

  get eventId(): string {
    return this.props.match.params.eventId || 'invalid_event_id';
  }

  componentDidMount(): void {
    document.title = 'Мероприятие';

    this.setState({ isFetching: true });

    api.events
      .exec('getEvent', { id: this.eventId, __delay: 0, __genErr: false })
      .then(({ event }) => {
        this.props.currentEventActions.eventInfoLoaded(event);
        document.title = event.name;
      })
      .catch(err => this.setState({ fetchErrorMsg: err.message }))
      .then(() => this.setState({ isFetching: false }));
  }

  render() {
    const { url: basePath } = this.props.match;

    const { isFetching, fetchErrorMsg } = this.state;
    const { event } = this.props.currentEvent;

    return (
      <section className="hero is-white">
        <div className="hero-body">
          <div className="container">
            {/* --- View header ---------------------------- */}

            <div className="columns">
              <div className="column is-12">
                {/* --- Название мероприятия ------------------------- */}

                <h3
                  className={classNames('title', {
                    'has-text-grey-lighter': isFetching,
                    'has-text-grey': !isFetching,
                  })}
                >
                  {event ? event.name : 'Мероприятие'}
                </h3>
                {/* --- Навигация ------------------------- */}
                <nav className="breadcrumb" aria-label="breadcrumbs">
                  <ul>
                    <li>
                      <Link to="/">Сервисы</Link>
                    </li>
                    <li>
                      <Link to="/public-events">Мероприятия</Link>
                    </li>
                    {event && (
                      <li className="is-active">
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="#" aria-current="page">
                          {event.name}
                        </a>
                      </li>
                    )}
                  </ul>
                </nav>
                <br />
              </div>
            </div>
            {/* --- View contents ---------------------- */}
            <div className="container">
              {isFetching && (
                <div className="columns">
                  <div className="column is-12">
                    <SimpleSpinner text="Загрузка..." />
                  </div>
                </div>
              )}
              {fetchErrorMsg && (
                <div className="columns">
                  <div className="column is-12">
                    <div className="notification is-danger is-light">
                      Не удалось загрузить данные мероприятия: {fetchErrorMsg}
                    </div>
                  </div>
                </div>
              )}
              {!isFetching && !fetchErrorMsg && event && (
                <div className="columns">
                  <div className="column is-2-fullhd is-3-desktop is-4-tablet">
                    {/* --- Менюха --------------------------- */}
                    <aside className="menu">
                      {/* --- Мероприятие ------------------------*/}
                      <p className="menu-label">Мероприятие</p>
                      <ul className="menu-list">
                        {/* --- Информация о мероприятии -------- */}
                        <li>
                          <NavLink
                            to={`${basePath}/info`}
                            activeClassName="is-active"
                          >
                            Общее
                          </NavLink>
                        </li>
                        {/* --- Прошедшие -------------- */}
                        <li>
                          <NavLink
                            to={`${basePath}/edit`}
                            activeClassName="is-active"
                          >
                            Редактировать
                          </NavLink>
                        </li>
                        {/* --- Fast-track --------------------------- */}
                        <li>
                          <NavLink
                            to={`${basePath}/fast-track`}
                            activeClassName="is-active"
                          >
                            Fast-track
                          </NavLink>
                        </li>
                        {/* --- Widget --------------------------- */}
                        <li>
                          <NavLink
                            to={`${basePath}/widget`}
                            activeClassName="is-active"
                          >
                            Виджет
                          </NavLink>
                        </li>
                      </ul>
                      {/* --- Посетители ------------------------*/}
                      <p className="menu-label">Посетители</p>
                      <ul className="menu-list">
                        {/* --- Текущие --------------------------- */}
                        <li>
                          <NavLink
                            to={`${basePath}/visitors`}
                            activeClassName="is-active"
                          >
                            Сводка
                          </NavLink>
                        </li>
                      </ul>
                    </aside>
                  </div>
                  <div className="column is-10-fullhd is-9-desktop is-8-tablet">
                    <Switch>
                      <Route
                        exact
                        path={basePath}
                        component={() => <Redirect to={`${basePath}/info`} />}
                      />
                      <Route path={`${basePath}/info`} component={EventInfo} />
                      <Route path={`${basePath}/edit`} component={EventEdit} />
                      <Route
                        path={`${basePath}/fast-track`}
                        component={EventFastTrack}
                      />
                      <Route
                        path={`${basePath}/widget`}
                        component={EventWidget}
                      />
                      <Route
                        path={`${basePath}/visitors`}
                        component={EventVisitorsInfo}
                      />

                      <Route
                        component={() => (
                          <small className="has-text-grey">
                            Выберите интересующий вас раздел
                          </small>
                        )}
                      />
                    </Switch>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Event);
