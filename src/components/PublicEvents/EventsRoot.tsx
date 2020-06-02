import React from 'react';
import { AppState } from '../../store/state';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Switch } from 'react-router';
import { Route, RouteComponentProps } from 'react-router-dom';

import EventsActual from './EventsActual';
import EventsArchive from './EventsArchive';
import EventsCreateNew from './EventsCreateNew';
import Surveys from './Surveys';
import SurveyCreate from './SurveysCreateNew';
import { Breadcrumbs } from '../Common/Breadcrumbs';

import './EventsRoot.scss';
import { MenuSection, SideMenu } from '../Common/SideMenu';
import { VEPageTitle } from '../Common/ViewElements';

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

  private sideMenuSections: MenuSection[] = [
    {
      title: 'Мероприятия',
      items: [
        {
          title: 'Актуальные',
          linkTo: '/actual',
        },
        {
          title: 'Архив',
          linkTo: '/archive',
        },
        {
          title: 'Создать мероприятие',
          linkTo: '/new',
        },
      ],
    },
    {
      title: 'Анкеты',
      items: [
        { title: 'Все анкеты', linkTo: '/surveys' },
        { title: 'Создать анкету', linkTo: '/new-survey' },
      ],
    },
  ];

  render() {
    const { path: basePath } = this.props.match;

    return (
      <section className="hero is-white">
        <div className="hero-body">
          {/* --- Титле ---------------------------- */}
          <div className="container">
            <div className="columns">
              <div className="column is-12">
                <VEPageTitle title="Мои мероприятия" />
                <Breadcrumbs
                  items={[{ linkTo: '/', title: 'Сервисы' }]}
                  current="Мероприятия"
                />
              </div>
            </div>
          </div>

          {/* --- Остальное ------------------------*/}

          <div className="container">
            <div className="columns">
              <div className="column is-2-fullhd is-3-desktop is-4-tablet">
                {/* --- Менюха --------------------------- */}
                <SideMenu
                  basePath={basePath}
                  sections={this.sideMenuSections}
                />
              </div>
              {/* --- Штуки справа от менюхи --------------------------- */}
              <div className="column is-10-fullhd is-9-desktop is-8-tablet">
                <Switch>
                  <Route
                    exact
                    path={basePath}
                    component={() => <Redirect to={`${basePath}/actual`} />}
                  />

                  <Route path={`${basePath}/actual`} component={EventsActual} />
                  <Route
                    path={`${basePath}/archive`}
                    component={EventsArchive}
                  />
                  <Route path={`${basePath}/new`} component={EventsCreateNew} />
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
