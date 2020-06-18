import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { Redirect, Switch } from 'react-router';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import api from '../../../back/server-api';

import { RootState } from '../../../store';
import { Actions as CurrentEventVisitorActions } from '../../../actions/current-event-visitor';
import { UnmountHelper } from '../../../utils/unmount-helper';
import { MenuSection, SideMenu } from '../../Common/SideMenu';
import { BreadcrumbItem, Breadcrumbs } from '../../Common/Breadcrumbs';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageTitle,
} from '../../Common/ViewElements';

import EventVisitorInfo from './EventVisitorInfo';
import { NameFormatter } from '../../../utils/name-formatter';

const mapStateToProps = (state: RootState) => {
  return {
    router: state.router,
    currentEventVisitor: state.currentEventVisitor,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    currentEventVisitorActions: bindActionCreators(
      CurrentEventVisitorActions,
      dispatch,
    ),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<{ visitorId?: string }>;

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
};

class EventVisitor extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: true,
    fetchErrorMsg: '',
  };

  get visitorId(): string {
    return this.props.match.params.visitorId || 'invalid_visitor_id';
  }

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Посетитель';

    this.props.currentEventVisitorActions.infoReset();
    this.setState({ isFetching: true, fetchErrorMsg: '' });

    this.uh
      .wrap(
        api.events.exec('getEventVisitor', {
          id: this.visitorId,
          __delay: 33,
          __genErr: false,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ fetchErrorMsg: err.message });
        } else {
          const { visitor } = results;
          this.props.currentEventVisitorActions.infoLoaded(visitor);
          document.title = new NameFormatter(visitor).getShortName();
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  private sideMenuSections: MenuSection[] = [
    {
      title: 'Посетитель',
      items: [
        {
          title: 'Обзор',
          linkTo: '/info',
        },
      ],
    },
  ];

  renderSwitch(basePath: string) {
    return (
      <Switch>
        <Route
          exact
          path={basePath}
          component={() => <Redirect to={`${basePath}/info`} />}
        />
        <Route path={`${basePath}/info`} component={EventVisitorInfo} />
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
    const { visitor } = this.props.currentEventVisitor;

    const bcItems: BreadcrumbItem[] = [
      { title: 'Сервисы', linkTo: '/' },
      { title: 'Мероприятия', linkTo: '/public-events' },
    ];

    if (visitor) {
      bcItems.push({
        title: _.truncate(visitor.eventName, {
          length: 32,
        }),
        linkTo: `/public-event/${visitor.eventId}/visitors`,
      });
    }

    const nf = new NameFormatter(visitor);

    return (
      <section className="hero is-white">
        <div className="hero-body">
          <div className="container">
            {/* --- View header ---------------------------- */}

            <div className="columns">
              <div className="column is-12">
                {/* --- Название мероприятия ------------------------- */}

                <VEPageTitle
                  title={visitor ? nf.getFullName() : 'Посетитель'}
                  isFetching={isFetching}
                />

                {/* --- Навигация ------------------------- */}

                <Breadcrumbs
                  items={bcItems}
                  current={visitor && nf.getShortName()}
                  currentMaxLength={32}
                />
              </div>
            </div>
          </div>

          {/* --- View contents ---------------------- */}

          <div className="container">
            <VEFetchingSpinner isFetching={isFetching} />
            <VEFetchError msg={fetchErrorMsg} />
            {!isFetching && !fetchErrorMsg && visitor && (
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

export default connect(mapStateToProps, mapDispatchToProps)(EventVisitor);
