import React from 'react';
import { Link } from 'react-router-dom';
import RU from 'date-fns/locale/ru';

import { SimpleSpinner } from '../Common/SimpleSpinner';
import { SurveyInfo } from '../../back/common/public-events/survey';

import api from '../../back/server-api';
import { UnmountHelper } from '../../utils/unmount-helper';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  VEFetchError,
  VEFetchingSpinner,
  VEPageSecondaryTitle,
} from '../Common/ViewElements';
import { truncate } from 'lodash';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  surveys: SurveyInfo[];
};

export default class Surveys extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    errorMsg: '',
    surveys: [],
  };

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Анкеты';

    this.setState({ isFetching: true });
    this.uh
      .wrap(
        api.events.exec('getSurveys', {
          __delay: 0,
          __genErr: false,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ errorMsg: err.message });
        } else {
          const { surveys } = results;
          this.setState({ surveys });
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  render() {
    const { isFetching, errorMsg, surveys } = this.state;

    return (
      <div className="container">
        <VEFetchingSpinner isFetching={isFetching} />
        <VEFetchError msg={errorMsg} />
        {!isFetching && !errorMsg && (
          <div className="columns">
            {surveys.length === 0 && (
              <div className="column is-12 has-text-centered">
                <p>Анкет нет</p>
                <br />
                <Link
                  className="button is-primary is-outlined"
                  to="/public-events/new-survey"
                >
                  Создать
                </Link>
              </div>
            )}
            {surveys.length > 0 && (
              <div className="column is-12">
                {surveys.map(survey => (
                  <div key={survey.id} className="box">
                    <VEPageSecondaryTitle
                      title={survey.name}
                      linkTo={`/public-event-survey/${survey.id}`}
                    />
                    <p
                      className="subtitle is-6"
                      style={{ marginBottom: '0.5rem' }}
                    >
                      {truncate(survey.description, { length: 160 })}
                    </p>
                    <p className="is-size-7">
                      Обновлено{' '}
                      {formatDistanceToNow(parseISO(survey.updatedAt), {
                        addSuffix: true,
                        locale: RU,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
