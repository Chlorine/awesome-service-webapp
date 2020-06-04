import React from 'react';

import { Route, RouteComponentProps } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { Redirect, Switch } from 'react-router';
import { connect } from 'react-redux';
import { truncate } from 'lodash';

import api from '../../../back/server-api';

import { AppState } from '../../../store/state';
import { UnmountHelper } from '../../../utils/unmount-helper';
import { MenuSection, SideMenu } from '../../Common/SideMenu';
import { Breadcrumbs } from '../../Common/Breadcrumbs';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageTitle,
} from '../../Common/ViewElements';

import QuestionEdit from './QuestionEdit';
import QuestionRemove from './QuestionRemove';

import { Actions as CurrentQuestionActions } from '../../../actions/current-question';

const mapStateToProps = (state: AppState) => {
  return {
    router: state.router,
    currentQuestion: state.currentQuestion,
    currentSurvey: state.currentSurvey,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    currentQuestionActions: bindActionCreators(
      CurrentQuestionActions,
      dispatch,
    ),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<{ questionId?: string }>;

declare type State = {
  isFetching: boolean;
  fetchErrorMsg: string;
};

class Question extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: true,
    fetchErrorMsg: '',
  };

  get questionId(): string {
    return this.props.match.params.questionId || 'invalid_question_id';
  }

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Вопрос';

    this.props.currentQuestionActions.infoReset();
    this.setState({ isFetching: true, fetchErrorMsg: '' });

    this.uh
      .wrap(
        api.events.exec('getSurveyQuestion', {
          id: this.questionId,
          __delay: 0,
          __genErr: false,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ fetchErrorMsg: err.message });
        } else {
          const { question } = results;
          this.props.currentQuestionActions.infoLoaded(question);
          document.title = question.text;
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  private sideMenuSections: MenuSection[] = [
    {
      title: 'Вопрос',
      items: [
        {
          title: 'Изменить параметры',
          linkTo: '/edit',
        },
        {
          title: 'Удаление',
          linkTo: '/remove',
          isDanger: false,
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
          component={() => <Redirect to={`${basePath}/edit`} />}
        />
        <Route path={`${basePath}/edit`} component={QuestionEdit} />
        <Route path={`${basePath}/remove`} component={QuestionRemove} />
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
    const { question } = this.props.currentQuestion;

    // может не быть если F5
    const { survey } = this.props.currentSurvey;

    return (
      <section className="hero is-white">
        <div className="hero-body">
          <div className="container">
            {/* --- View header ---------------------------- */}

            <div className="columns">
              <div className="column is-12">
                {/* --- Текст вопроса ------------------------- */}

                <VEPageTitle
                  title={question?.text || 'Текст вопроса'}
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
                    {
                      title: truncate(survey?.name || 'Анкета', { length: 32 }),
                      linkTo: `/public-event-survey/${question?.surveyId}`,
                    },
                  ]}
                  current={question?.text}
                  currentMaxLength={32}
                />
              </div>
            </div>
          </div>

          {/* --- View contents ---------------------- */}

          <div className="container">
            <VEFetchingSpinner isFetching={isFetching} />
            <VEFetchError msg={fetchErrorMsg} />
            {!isFetching && !fetchErrorMsg && question && (
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

export default connect(mapStateToProps, mapDispatchToProps)(Question);
