import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Link } from 'react-router-dom';
import _ from 'lodash';

import {
  VEFetchError,
  VEFetchingSpinner,
  VEObjectPropertyInfo,
} from '../../Common/ViewElements';

import { UnmountHelper } from '../../../utils/unmount-helper';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import api from '../../../back/server-api';

import { RootState } from '../../../store';
import { NameFormatter } from '../../../utils/name-formatter';
import { DateUtils } from '../../../utils/date-utils';
import { visitorSourceType2Str } from './EventVisitors';
import { SurveyInfo } from '../../../back/common/public-events/survey';
import { SurveyAnswerInfo } from '../../../back/common/public-events';

const mapStateToProps = (state: RootState) => {
  return {
    currentEventVisitor: state.currentEventVisitor,
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
  survey: SurveyInfo | null;
};

class EventVisitorInfo extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    errorMsg: '',
    survey: null,
  };

  componentDidMount(): void {
    this.uh.onMount();

    const { visitor } = this.props.currentEventVisitor;
    if (visitor) {
      document.title = new NameFormatter(visitor).getShortName();

      this.setState({ isFetching: true });

      this.uh.wrap(this.fetchData()).then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ errorMsg: err.message });
        } else {
          const { survey } = results;
          this.setState({ survey });
        }
      });
    }
  }

  fetchData = async () => {
    let survey: SurveyInfo | null = null;
    const visitor = this.props.currentEventVisitor.visitor!;

    const { event } = await api.events.exec('getEvent', {
      id: visitor.eventId,
    });

    if (event.surveyId) {
      survey = (await api.events.exec('getSurvey', { id: event.surveyId }))
        .survey;
    }

    return {
      survey,
    };
  };

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  renderSurveyAnswersBox() {
    const visitor = this.props.currentEventVisitor.visitor!;
    const { surveyAnswers } = visitor;
    const { survey } = this.state;

    return (
      <div className="box">
        {!survey && (
          <h3 className="title is-6 has-text-grey-lighter">
            Анкета для мероприятия не задана
          </h3>
        )}
        {survey && (
          <>
            <h3 className="title is-5 has-text-grey text-truncate">
              {survey.name}
            </h3>
            <h4 className="subtitle is-6 has-text-grey-light text-truncate">
              {survey.description}
            </h4>
            <ul className="list">
              {survey.questions!.map((q, index) => (
                <li key={q.id} className="list-item">
                  <article className="media">
                    <div className="media-left">
                      <span className="number-circle has-text-grey-light">
                        <span className="has-text-weight-bold">
                          {index + 1}
                        </span>
                      </span>
                    </div>
                    <div className="media-content zero-min-width">
                      <div>{q.text}</div>
                      <div className="mt-2">
                        <AnswerAsTags
                          answers={selectAnswerByQuestionId(
                            surveyAnswers,
                            q.id,
                          )}
                        />
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  renderCommonInfoBox() {
    const visitor = this.props.currentEventVisitor.visitor!;

    const {
      lastName,
      firstName,
      middleName,
      companyName,
      position,
      email,
      phone,
      regTimestamp,
      sourceType,
    } = visitor;

    return (
      <div className="box">
        {/* --- Немножко штук справа ---------- */}

        <div className="is-pulled-right has-text-right">
          {/* --- Когда зарегистр. ---------- */}

          <div>
            <span className="tag is-light is-medium">
              {DateUtils.format(regTimestamp, 'dd.MM.yyyy в HH:mm')}
            </span>
          </div>

          {/* --- Через что ---------- */}

          <div className="mt-1">
            <span className="tag is-info is-light is-medium">
              {visitorSourceType2Str(sourceType)}
            </span>
          </div>
        </div>

        {/* --- ФИО ------------- */}

        <h3 className="title is-4 has-text-grey">{lastName}</h3>
        <h3 className="subtitle is-5 has-text-grey">
          {firstName} {middleName}
        </h3>

        {/* --- Компания -------------- */}

        <VEObjectPropertyInfo propName="Компания" value={companyName} />
        <VEObjectPropertyInfo propName="Должность" value={position} />

        <br />

        {/* --- Контакты --------------- */}

        <VEObjectPropertyInfo
          propName=""
          propIcon="fa-envelope"
          value={email}
          href={`mailto:${email}`}
          valueNotAvailableText="Email отсутствует"
        />

        <VEObjectPropertyInfo
          propName=""
          propIcon="fa-phone"
          value={phone}
          href={`tel:${phone}`}
          valueNotAvailableText="Телефон отсутствует"
        />
      </div>
    );
  }

  render() {
    const { isFetching, errorMsg } = this.state;

    return (
      <div className="container">
        <VEFetchingSpinner isFetching={isFetching} />
        <VEFetchError msg={errorMsg} />
        {!isFetching && !errorMsg && (
          <div className="columns">
            <div className="column is-12">
              {this.renderCommonInfoBox()}
              {this.renderSurveyAnswersBox()}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventVisitorInfo);

function selectAnswerByQuestionId(
  answers: SurveyAnswerInfo[],
  questionId: string,
): string[] | null {
  const answer = answers.find(a => a.questionId === questionId);
  if (!answer) return null;

  if (Array.isArray(answer.value)) {
    return answer.value.map(v => v.toString());
  }

  if (typeof answer.value === 'string') {
    return [answer.value];
  }

  return [answer.value ? 'Да' : 'Нет'];
}

const AnswerAsTags: React.FC<{ answers: string[] | null }> = ({ answers }) => {
  if (!answers) {
    return (
      <span className="tag is-medium is-warning is-light">
        Нет данных об ответе
      </span>
    );
  }

  return (
    <>
      {answers.map((a, index) => (
        <span className="tag is-medium is-info is-light mr-2">
          {_.truncate(a, { length: 48 })}
        </span>
      ))}
    </>
  );
};
