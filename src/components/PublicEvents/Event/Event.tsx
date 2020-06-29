import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { Redirect, Switch } from 'react-router';
import { connect } from 'react-redux';

import api from '../../../back/server-api';

import { RootState } from '../../../store';
import { Actions as CurrentEventActions } from '../../../actions/current-event';
import { UnmountHelper } from '../../../utils/unmount-helper';
import { MenuSection, SideMenu } from '../../Common/SideMenu';
import { Breadcrumbs } from '../../Common/Breadcrumbs';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageTitle,
} from '../../Common/ViewElements';

import EventEdit from './EventEdit';
import EventImage from './EventImage';
import EventFastTrack from './EventFastTrack';
import EventWidget from './EventWidget';
import EventVisitors from './EventVisitors';
import EventInfo from './EventInfo';

const mapStateToProps = (state: RootState) => {
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
  uh = new UnmountHelper();

  state: State = {
    isFetching: true,
    fetchErrorMsg: '',
  };

  get eventId(): string {
    return this.props.match.params.eventId || 'invalid_event_id';
  }

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Мероприятие';

    this.props.currentEventActions.eventInfoReset();
    this.setState({ isFetching: true, fetchErrorMsg: '' });

    this.uh
      .wrap(
        api.events.exec('getEvent', {
          id: this.eventId,
          __delay: 0,
          __genErr: false,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ fetchErrorMsg: err.message });
        } else {
          const { event } = results;
          this.props.currentEventActions.eventInfoLoaded(event);
          document.title = event.name;
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  private sideMenuSections: MenuSection[] = [
    {
      title: 'Мероприятие',
      items: [
        {
          title: 'Обзор',
          linkTo: '/info',
        },
        {
          title: 'Параметры',
          linkTo: '/edit',
        },
        {
          title: 'Баннер',
          linkTo: '/banner',
        },
        {
          title: 'Логотип',
          linkTo: '/logo',
        },
        {
          title: 'Fast-track',
          linkTo: '/fast-track',
        },
        {
          title: 'Виджет регистрации',
          linkTo: '/widget',
        },
      ],
    },
    {
      title: 'Посетители',
      items: [{ title: 'Список', linkTo: '/visitors' }],
    },
  ];

  renderSwitch(basePath: string) {
    // noinspection PointlessArithmeticExpressionJS

    return (
      <Switch>
        <Route
          exact
          path={basePath}
          component={() => <Redirect to={`${basePath}/info`} />}
        />
        <Route path={`${basePath}/info`} component={EventInfo} />
        <Route path={`${basePath}/edit`} component={EventEdit} />
        <Route
          path={`${basePath}/banner`}
          render={props => (
            <EventImage
              key={1}
              title="Баннер мероприятия"
              subtitle="Широкая картинка для карточки мероприятия"
              objectType="public-event-banner"
              cropAspectRatio={3 / 1}
              {...props}
            />
          )}
        />
        <Route
          path={`${basePath}/logo`}
          render={props => (
            <EventImage
              key={2}
              title="Логотип мероприятия"
              subtitle="Маленькая картинка для различного рода списков"
              objectType="public-event-logo"
              cropAspectRatio={1 / 1}
              {...props}
            />
          )}
        />
        <Route path={`${basePath}/fast-track`} component={EventFastTrack} />
        <Route path={`${basePath}/widget`} component={EventWidget} />
        <Route path={`${basePath}/visitors`} component={EventVisitors} />
        <Route
          component={() => (
            <small className="has-text-grey">
              Выберите интересующий вас раздел
            </small>
          )}
        />
      </Switch>
    );
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

                <VEPageTitle
                  title={event?.name || 'Мероприятие'}
                  isFetching={isFetching}
                />

                {/* --- Навигация ------------------------- */}

                <Breadcrumbs
                  items={[
                    { title: 'Сервисы', linkTo: '/' },
                    { title: 'Мероприятия', linkTo: '/public-events' },
                  ]}
                  current={event && event.name}
                  currentMaxLength={32}
                />
              </div>
            </div>
          </div>

          {/* --- View contents ---------------------- */}

          <div className="container">
            <VEFetchingSpinner isFetching={isFetching} />
            <VEFetchError msg={fetchErrorMsg} />
            {!isFetching && !fetchErrorMsg && event && (
              <div className="columns">
                {/* --- Menu ----------------------- */}

                <div className="column is-2-fullhd is-3-desktop is-4-tablet">
                  <SideMenu
                    basePath={basePath}
                    sections={this.sideMenuSections}
                  />
                </div>

                {/* --- Subviews */}

                <div className="column is-10-fullhd is-9-desktop is-8-tablet">
                  {this.renderSwitch(basePath)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Event);
