import React from 'react';
import { Link } from 'react-router-dom';
import RU from 'date-fns/locale/ru';

import { SurveyInfo } from '../../back/common/public-events/survey';

import api from '../../back/server-api';
import { UnmountHelper } from '../../utils/unmount-helper';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  VEDescriptionAsSubtitle,
  VEPageSecondaryTitle,
} from '../Common/ViewElements';

import {
  getSavedPageSize,
  PaginationControls,
  PaginationState,
} from '../Common/Pagination';
import { Alert } from '../Common/Alert';

import DEFAULT_SURVEY_LOGO from './../../images/public-event-survey-02.svg';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  surveys: SurveyInfo[];
} & PaginationState;

const PG_VIEW_NAME = 'surveys';

export default class Surveys extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    errorMsg: '',
    surveys: [],
    // pagination:
    pageSize: getSavedPageSize(PG_VIEW_NAME),
  };

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Анкеты';

    this.goToPage(1);
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  goToPage = (page: number) => {
    const { pageSize } = this.state;

    this.setState({ isFetching: true, errorMsg: '' });

    this.uh
      .wrap(
        api.events.exec('getSurveys', {
          limit: pageSize,
          offset: pageSize * (page - 1),
          __delay: 33,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ errorMsg: err.message });
        } else {
          const { surveys } = results;
          this.setState({ surveys, pgRes: results });
        }
      });
  };

  render() {
    const { isFetching, errorMsg, surveys, pgRes, pageSize } = this.state;

    return (
      <div className="container">
        <div className="columns">
          <div className="column is-12">
            {!pgRes && isFetching && (
              <div className="flex-row-centered has-text-grey-light has-text-weight-bold">
                <span className="loader is-loading mr-3" /> Загрузка...
              </div>
            )}
            {errorMsg && (
              <Alert type="danger">
                Не удалось загрузить анкеты: {errorMsg}
              </Alert>
            )}
            {!isFetching && !errorMsg && surveys.length === 0 && (
              <div className="has-text-centered has-text-grey">
                <p className="has-text-grey">Анкет еще нет</p>
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
              <>
                {surveys.map(survey => (
                  <SurveyCard key={survey.id} survey={survey} />
                ))}
                <PaginationControls
                  pgViewName={PG_VIEW_NAME}
                  pgRes={pgRes}
                  isFetching={isFetching}
                  goToPage={this.goToPage}
                  pageSize={pageSize}
                  handlePageSizeChange={newPageSize => {
                    this.setState({ pageSize: newPageSize }, () => {
                      this.goToPage(1);
                    });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const SurveyCard: React.FC<{ survey: SurveyInfo }> = ({ survey }) => {
  return (
    <div className="box">
      <div className="media">
        <div className="media-left">
          <figure className="image is-48x48">
            <img src={DEFAULT_SURVEY_LOGO} alt="" />
          </figure>
        </div>
        <div className="media-content zero-min-width">
          <VEPageSecondaryTitle
            title={survey.name}
            linkTo={`/public-event-survey/${survey.id}`}
          />
          <VEDescriptionAsSubtitle descr={survey.description} />
          <p className="is-size-7">
            Обновлено{' '}
            {formatDistanceToNow(parseISO(survey.updatedAt), {
              addSuffix: true,
              locale: RU,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
