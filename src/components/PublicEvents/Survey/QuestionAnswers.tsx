import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from 'recharts';

import api from '../../../back/server-api';

import { UnmountHelper } from '../../../utils/unmount-helper';
import { SurveyQuestionInfo } from '../../../back/common/public-events/survey-question';
import { Alert } from '../../Common/Alert';
import { GenericObject } from '../../../back/common';
import { SurveyQuestionAnswersInfo } from '../../../back/common/public-events';
import { VEFetchingSpinner } from '../../Common/ViewElements';

export type Props = {
  question: SurveyQuestionInfo;
  eventId?: string | null;
  hideTitle?: boolean;
};

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  answersInfo?: SurveyQuestionAnswersInfo;
  data: ChartDataItem[];
};

const COLORS = [
  '#8aae9e',
  '#c6a087',
  '#a4adbc',
  '#c3a1b6',
  '#b0bc9a',
  '#c6bc87',
  '#c2b6a4',
  '#b1b1b1',
];

declare type ChartDataItem = GenericObject;

function prepareDataItems(
  answersInfo: SurveyQuestionAnswersInfo,
  q: SurveyQuestionInfo,
): ChartDataItem[] {
  const res: ChartDataItem[] = [];

  switch (q.answerType) {
    case 'YesNo':
      Object.keys(answersInfo.chosenVariants).forEach(key => {
        res.push({
          name: key,
          value: answersInfo.chosenVariants[key],
        });
      });
      break;
    case 'OneOf':
    case 'SomeOf':
      res.push({ ...answersInfo.chosenVariants, name: 'Варианты ответов' });
      break;
  }

  return res;
}

export default class QuestionAnswers extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    errorMsg: '',
    data: [],
  };

  componentDidMount(): void {
    this.uh.onMount();

    this.fetchData();
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any,
  ): void {
    if (this.props.eventId !== prevProps.eventId) {
      this.fetchData();
    }
  }

  fetchData() {
    const { question, eventId } = this.props;

    this.setState({
      isFetching: true,
      errorMsg: '',
    });

    this.uh
      .wrap(
        api.events.exec('getSurveyQuestionAnswers', {
          surveyId: question.surveyId,
          questionId: question.id,
          eventId: eventId || undefined,
          __delay: 333,
        }),
      )
      .then(({ err, results }) => {
        this.setState({ isFetching: false });
        if (err) {
          this.setState({ errorMsg: err.message });
        } else {
          const { answersInfo } = results;
          this.setState({
            answersInfo,
            data: prepareDataItems(answersInfo, question),
          });
          // console.log(
          //   JSON.stringify(prepareDataItems(answers, question), null, 2),
          // );
        }
      });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  renderYesNoChart() {
    const { data } = this.state;

    return (
      <ResponsiveContainer height={300}>
        <PieChart>
          <Pie dataKey="value" data={data} fill="#82ca9d" label={true}>
            {data.map((entry: any, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend align="center" />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  renderVariantsChart() {
    const { data } = this.state;
    if (data.length === 0) return null;

    return (
      <ResponsiveContainer height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend align="center" />
          {Object.keys(data[0])
            .filter(key => key !== 'name')
            .map((key, index) => (
              <Bar
                key={`bar-${index}`}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  renderChart() {
    const { answerType } = this.props.question;
    const { answersInfo } = this.state;

    // когда по нулям, показывать нечего
    if (
      !answersInfo ||
      0 ===
        Object.keys(answersInfo.chosenVariants).reduce(
          (prev, curr) => prev + answersInfo.chosenVariants[curr],
          0,
        )
    ) {
      return <span className="has-text-grey-light">Нет данных</span>;
    }

    switch (answerType) {
      case 'YesNo':
        return this.renderYesNoChart();
      case 'OneOf':
      case 'SomeOf':
        return this.renderVariantsChart();
    }

    return null;
  }

  render() {
    const { isFetching, errorMsg, data } = this.state;
    const { question, hideTitle } = this.props;
    const { text, description } = question;

    return (
      <div className="box">
        {isFetching && !hideTitle && (
          <div className="has-text-grey-light is-pulled-right">
            <span className="loader is-loading" />
          </div>
        )}
        {isFetching && hideTitle && (
          <VEFetchingSpinner isFetching={isFetching} />
        )}
        {!hideTitle && <h3 className="title is-5 has-text-grey">{text}</h3>}
        {!hideTitle && (
          <h3 className="subtitle is-6 has-text-grey">{description}</h3>
        )}
        <div className="columns">
          <div className="column is-12 has-text-centered">
            {errorMsg && (
              <Alert
                type="danger"
                onClose={() => this.setState({ errorMsg: '' })}
              >
                Ошибка загрузки ответов: {errorMsg}
              </Alert>
            )}
            {data.length > 0 && this.renderChart()}
          </div>
        </div>
      </div>
    );
  }
}
