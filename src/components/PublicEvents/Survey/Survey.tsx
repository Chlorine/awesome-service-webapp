import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { Redirect, Switch } from 'react-router';
import { connect } from 'react-redux';

import api from '../../../back/server-api';

import { MenuSection, SideMenu } from '../../Common/SideMenu';
import { Breadcrumbs } from '../../Common/Breadcrumbs';
import { AppState } from '../../../store/state';
import { Actions as CurrentSurveyActions } from '../../../actions/current-survey';
import { UnmountHelper } from '../../../utils/unmount-helper';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageTitle,
} from '../../Common/ViewElements';

import SurveyQuestions from './SurveyQuestions';
import SurveyEdit from './SurveyEdit';
import SurveyAnswers from './SurveyAnswers';

const mapStateToProps = (state: AppState) => {
  return {
    router: state.router,
    currentSurvey: state.currentSurvey,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    currentSurveyActions: bindActionCreators(CurrentSurveyActions, dispatch),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<{ surveyId?: string }>;

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
};

class Survey extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    fetchErrorMsg: '',
  };

  get surveyId(): string {
    return this.props.match.params.surveyId || 'invalid_survey_id';
  }

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Анкета';

    this.props.currentSurveyActions.surveyInfoReset();
    this.setState({ isFetching: true, fetchErrorMsg: '' });

    this.uh
      .wrap(
        api.events.exec('getSurvey', {
          id: this.surveyId,
          __delay: 0,
          __genErr: false,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ fetchErrorMsg: err.message });
        } else {
          const { survey } = results;
          this.props.currentSurveyActions.surveyInfoLoaded(survey);
          document.title = survey.name;
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  private sideMenuSections: MenuSection[] = [
    {
      title: 'Анкета',
      items: [
        {
          title: 'Вопросы',
          linkTo: '/questions',
        },
        {
          title: 'Изменить параметры',
          linkTo: '/edit',
        },
      ],
    },
    {
      title: 'Ответы',
      items: [{ title: 'Сводка', linkTo: '/answers' }],
    },
  ];

  renderSwitch(basePath: string) {
    return (
      <Switch>
        <Route
          exact
          path={basePath}
          component={() => <Redirect to={`${basePath}/questions`} />}
        />
        <Route path={`${basePath}/questions`} component={SurveyQuestions} />
        <Route path={`${basePath}/edit`} component={SurveyEdit} />
        <Route path={`${basePath}/answers`} component={SurveyAnswers} />
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
    const { survey } = this.props.currentSurvey;

    return (
      <section className="hero is-white">
        <div className="hero-body">
          <div className="container">
            {/* --- View header ---------------------------- */}

            <div className="columns">
              <div className="column is-12">
                {/* --- Название анкеты ------------------------- */}

                <VEPageTitle
                  title={survey?.name || 'Анкета'}
                  isFetching={isFetching}
                />
                {/* --- Навигация ------------------------- */}
                <Breadcrumbs
                  items={[
                    { title: 'Сервисы', linkTo: '/' },
                    {
                      title: 'Анкеты мероприятий',
                      linkTo: '/public-events/surveys',
                    },
                  ]}
                  current={survey && survey.name}
                />
              </div>
            </div>
            {/* --- View contents ---------------------- */}

            <VEFetchingSpinner isFetching={isFetching} />
            <VEFetchError msg={fetchErrorMsg} />
            {!isFetching && !fetchErrorMsg && survey && (
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

export default connect(mapStateToProps, mapDispatchToProps)(Survey);
