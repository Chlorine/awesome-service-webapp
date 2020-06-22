import React from 'react';
import { Dispatch } from 'redux';
import * as _ from 'lodash';
import { RootState } from '../../../store';
import { connect } from 'react-redux';

import QuestionAnswers from './QuestionAnswers';
import { UnmountHelper } from '../../../utils/unmount-helper';
import api from '../../../back/server-api';
import { Results } from '../../../back/common/public-events/api';
import { Alert } from '../../Common/Alert';
import { formatEventDates } from '../../../utils/format-event-date';

const mapStateToProps = (state: RootState) => {
  return {
    currentSurvey: state.currentSurvey,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    questionId?: string;
  };

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  events: Results<'getEventsBySurvey'>['events'];
  eventId: string;
};

class SurveyAnswers extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    errorMsg: '',
    events: [],
    eventId: '',
  };

  componentDidMount(): void {
    this.uh.onMount();

    const { questionId } = this.props;

    document.title = questionId
      ? 'Ответы на вопрос анкеты'
      : 'Ответы на вопросы анкеты';

    this.setState({ isFetching: true });
    this.uh
      .wrap(
        api.events.exec('getEventsBySurvey', {
          surveyId: this.survey.id,
          __delay: 300,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ errorMsg: err.message });
        } else {
          const { events } = results;
          this.setState({ events });
        }
      });
  }

  get survey() {
    return this.props.currentSurvey.survey!;
  }

  get questions() {
    return this.survey.questions!;
  }

  renderToolbar() {
    const { eventId, events } = this.state;

    return (
      <div className="box py-3">
        <div className="flex-row-left">
          <div className="is-hidden-mobile pr-4 has-text-weight-bold has-text-grey">
            Мероприятие
          </div>
          <div className="select is-fullwidth">
            <select
              value={eventId}
              onChange={e => this.setState({ eventId: e.currentTarget.value })}
            >
              <option value="">Все</option>
              {events.map((event, index) => (
                <option key={event.id} value={event.id}>
                  {`${_.truncate(event.name, {
                    length: 32,
                  })} (${formatEventDates(event.start, event.end)})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { isFetching, errorMsg, eventId } = this.state;
    const { questionId } = this.props;

    return (
      <div className="container">
        {isFetching && (
          <div className="flex-row-centered has-text-grey-light has-text-weight-bold">
            <span className="loader is-loading mr-3" /> Загрузка...
          </div>
        )}
        {errorMsg && (
          <Alert type="danger">
            Не удалось загрузить мероприятия: {errorMsg}
          </Alert>
        )}
        {!isFetching && !errorMsg && (
          <>
            {this.questions.length === 0 && (
              <div className="has-text-centered">
                <p className="has-text-grey">
                  Ответов нет (в анкете еще нет вопросов)
                </p>
              </div>
            )}
            {this.questions.length > 0 && (
              <>
                {this.renderToolbar()}
                {this.questions
                  .filter(q => (questionId ? q.id === questionId : true))
                  .map(q => (
                    <QuestionAnswers
                      key={q.id}
                      question={q}
                      eventId={eventId}
                      hideTitle={!!questionId}
                    />
                  ))}
              </>
            )}
          </>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SurveyAnswers);
