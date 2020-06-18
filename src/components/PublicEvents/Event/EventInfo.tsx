import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import { formatEventDates } from '../../../utils/format-event-date';
import {
  VEDescriptionAsSubtitle,
  VEFetchError,
  VEFetchingSpinner,
} from '../../Common/ViewElements';

import { UnmountHelper } from '../../../utils/unmount-helper';
import api from '../../../back/server-api';
import { SurveyInfo } from '../../../back/common/public-events/survey';
import { Pluralize, Words } from '../../../utils/pluralize-ru';
import { Link } from 'react-router-dom';
import { RootState } from '../../../store';

const mapStateToProps = (state: RootState) => {
  return {
    currentEvent: state.currentEvent,
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
  visitorCount: number;
};

class EventInfo extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    errorMsg: '',
    survey: null,
    visitorCount: 0,
  };

  componentDidMount(): void {
    this.uh.onMount();

    const { event } = this.props.currentEvent;
    if (event) {
      document.title = event.name;

      this.setState({ isFetching: true });

      this.uh.wrap(this.fetchEventData()).then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ errorMsg: err.message });
        } else {
          const { survey, visitorCount } = results;
          this.setState({ survey, visitorCount });
        }
      });
    }
  }

  fetchEventData = async () => {
    let survey: SurveyInfo | null = null;
    let visitorCount = 0;

    const { event } = this.props.currentEvent;
    if (event) {
      if (event.surveyId) {
        survey = (
          await api.events.exec('getSurvey', {
            id: event.surveyId,
            __delay: 0,
          })
        ).survey;
      }

      visitorCount = (
        await api.events.exec('getEventVisitorCount', { id: event.id })
      ).count;
    }

    return {
      survey,
      visitorCount,
    };
  };

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  render() {
    const { isFetching, errorMsg, survey, visitorCount } = this.state;
    const event = this.props.currentEvent.event!;

    return (
      <div className="container">
        <VEFetchingSpinner isFetching={isFetching} />
        <VEFetchError msg={errorMsg} />
        {!isFetching && !errorMsg && (
          <div className="columns">
            <div className="column is-12">
              <div className="box">
                {/* --- Название и описание -------------- */}

                <h3 className="title is-4 has-text-grey">{event.name}</h3>
                <VEDescriptionAsSubtitle descr={event.description} />

                {/* --- Даты -------------- */}

                <p className="is-size-5 has-text-weight-bold has-text-grey">
                  <span className="icon has-text-primary">
                    <i className="fa fa-calendar" />
                  </span>{' '}
                  {formatEventDates(event.start, event.end)}
                </p>

                <br />

                {/* --- Место и адрес -------------- */}

                <p>
                  <strong>Место проведения: </strong>
                  {event.place.name}
                </p>
                <p>
                  <strong>Адрес: </strong>
                  {event.place.address}
                </p>

                <hr />

                {/* --- Анкета -------------- */}

                <p className="is-size-6 has-text-weight-bold has-text-grey">
                  <span className="icon has-text-primary">
                    <i className="fa fa-list-ol" />
                  </span>{' '}
                  {survey && (
                    <Link
                      className="has-text-link"
                      to={`/public-event-survey/${survey.id}`}
                    >
                      {_.truncate(survey.name, { length: 32 })}
                    </Link>
                  )}
                  {!survey && (
                    <span className="has-text-grey-lighter">Без анкеты</span>
                  )}
                </p>

                {/* --- Посетители -------------- */}

                <p className="is-size-6 has-text-weight-bold has-text-grey">
                  <span className="icon has-text-primary">
                    <i className="fa fa-users" />
                  </span>{' '}
                  {visitorCount === 0 && (
                    <span className="has-text-grey-lighter">
                      Посетителей пока нет
                    </span>
                  )}
                  {visitorCount > 0 && (
                    <Link
                      className="has-text-link"
                      to={`/public-event/${event.id}/visitors`}
                    >
                      {Pluralize.count(visitorCount, Words.Visitors)}
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventInfo);
