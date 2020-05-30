import React from 'react';
import { AppState } from '../../store/state';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Switch } from 'react-router';
import { Link, NavLink, Route, RouteComponentProps } from 'react-router-dom';

import ActualEvents from './ActualEvents';
import EventsArchive from './EventsArchive';
import EventCreate from './EventCreate';
import Surveys from './Surveys';
import SurveyCreate from './SurveyCreate';

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
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps;

declare type State = {
  errorMsg: string;
};

declare type FormValues = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

class EventsRoot extends React.Component<Props, State> {
  state: State = {
    errorMsg: '',
  };

  componentDidMount(): void {
    document.title = 'Мои мероприятия';
  }

  render() {
    const { path: basePath } = this.props.match;
    // const basePath = //'/profile';

    return (
      <section className="hero is-white">
        <div className="hero-body">
          {/* --- Титле ---------------------------- */}
          <div className="container">
            <div className="columns">
              <div className="column is-12">
                <h3 className="title has-text-grey">Мои мероприятия</h3>
                <nav className="breadcrumb" aria-label="breadcrumbs">
                  <ul>
                    <li>
                      <Link to="/">Сервисы</Link>
                    </li>
                    <li className="is-active">
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a href="#" aria-current="page">
                        Мероприятия
                      </a>
                    </li>
                  </ul>
                </nav>
                <br />
              </div>
            </div>
          </div>

          {/* --- Остальное ------------------------*/}

          <div className="container" style={{ marginTop: '0.75rem' }}>
            <div className="columns">
              <div className="column is-2-fullhd is-3-desktop is-4-tablet">
                {/* --- Менюха --------------------------- */}
                <aside className="menu">
                  {/* --- Мероприятия ------------------------*/}
                  <p className="menu-label">Мероприятия</p>
                  <ul className="menu-list">
                    {/* --- Текущие --------------------------- */}
                    <li>
                      <NavLink
                        to={`${basePath}/actual`}
                        activeClassName="is-active"
                      >
                        Актуальные
                      </NavLink>
                    </li>
                    {/* --- Прошедшие -------------- */}
                    <li>
                      <NavLink
                        to={`${basePath}/archive`}
                        activeClassName="is-active"
                      >
                        Архив
                      </NavLink>
                    </li>
                    {/* --- Новое --------------------------- */}
                    <li>
                      <NavLink
                        to={`${basePath}/new`}
                        activeClassName="is-active"
                      >
                        Создать мероприятие
                      </NavLink>
                    </li>
                  </ul>
                  {/* --- Анкеты ------------------------*/}
                  <p className="menu-label">Анкеты</p>
                  <ul className="menu-list">
                    {/* --- Текущие --------------------------- */}
                    <li>
                      <NavLink
                        to={`${basePath}/surveys`}
                        activeClassName="is-active"
                      >
                        Все анкеты
                      </NavLink>
                    </li>
                    {/* --- Новая -------------- */}
                    <li>
                      <NavLink
                        to={`${basePath}/new-survey`}
                        activeClassName="is-active"
                      >
                        Создать анкету
                      </NavLink>
                    </li>
                  </ul>
                </aside>
              </div>
              {/* --- Штуки справа от менюхи --------------------------- */}
              <div className="column is-10-fullhd is-9-desktop is-8-tablet">
                <Switch>
                  <Route
                    exact
                    path={basePath}
                    component={() => <Redirect to={`${basePath}/actual`} />}
                  />

                  <Route path={`${basePath}/actual`} component={ActualEvents} />
                  <Route
                    path={`${basePath}/archive`}
                    component={EventsArchive}
                  />
                  <Route path={`${basePath}/new`} component={EventCreate} />
                  <Route path={`${basePath}/surveys`} component={Surveys} />
                  <Route
                    path={`${basePath}/new-survey`}
                    component={SurveyCreate}
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
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventsRoot);
