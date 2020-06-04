import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortEnd,
} from 'react-sortable-hoc';

import arrayMove from 'array-move';

import api from '../../../back/server-api';

import { AppState } from '../../../store/state';
import { Actions as CurrentSurveyActions } from '../../../actions/current-survey';
import { SurveyQuestionInfo } from '../../../back/common/public-events/survey-question';
import { UnmountHelper } from '../../../utils/unmount-helper';
import {
  VEDescriptionAsSubtitle,
  VEFetchError,
  VEFetchingSpinner,
  VEPageSecondaryTitle,
} from '../../Common/ViewElements';

import './SurveyQuestions.scss';
import { ANSWER_TYPE_NAMES } from './SurveyQuestionsCreateNew';

const mapStateToProps = (state: AppState) => {
  return {
    currentSurvey: state.currentSurvey,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    currentSurveyActions: bindActionCreators(CurrentSurveyActions, dispatch),
  };
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  questions: SurveyQuestionInfo[];
  isSavingDisplayOrder: boolean;
  savingErrorMsg: string;
};

declare type DragHandleProps = {
  isSavingDisplayOrder: boolean;
};

const QuestionDragHandle = SortableHandle(
  ({ isSavingDisplayOrder }: DragHandleProps) => (
    <span className="icon">
      {isSavingDisplayOrder ? (
        <i className="loader is-loading" />
      ) : (
        <i className="fa fa-bars has-text-grey-lighter cursor-row-resize" />
      )}
    </span>
  ),
);

declare type QuestionSortableElementProps = {
  value: SurveyQuestionInfo;
  currIndex: number;
  isSavingDisplayOrder: boolean;
};

const QuestionSortableElement = SortableElement(
  ({
    value,
    currIndex,
    isSavingDisplayOrder,
  }: QuestionSortableElementProps) => {
    const { id, text, description, answerType, displayOrder } = value;

    return (
      <li className="li-sortable li-survey-question">
        <div className="box">
          <article className="media">
            <div className="media-left">
              <span className="number-circle has-text-grey-light">
                <span className="has-text-weight-bold">{currIndex + 1}</span>
              </span>
            </div>
            <div className="media-content zero-min-width">
              <VEPageSecondaryTitle
                title={text}
                linkTo={`/public-event-survey-question/${id}`}
              />
              <VEDescriptionAsSubtitle
                descr={description}
                stub="Без пояснения"
              />
              <p>
                <strong>Тип ответа: </strong>
                {ANSWER_TYPE_NAMES[answerType]}
              </p>
              {/*<p>*/}
              {/*  <strong>displayOrder: </strong>#{displayOrder}*/}
              {/*</p>*/}
            </div>
            <div className="media-right">
              <QuestionDragHandle isSavingDisplayOrder={isSavingDisplayOrder} />
            </div>
          </article>
        </div>
      </li>
    );
  },
);

declare type QuestionsSortableContainerProps = {
  items: SurveyQuestionInfo[];
  isSavingDisplayOrder: boolean;
};

const QuestionsSortableContainer = SortableContainer(
  ({ items, isSavingDisplayOrder }: QuestionsSortableContainerProps) => {
    return (
      <ul className="ul-sortable-container">
        {items.map((q, index) => (
          <QuestionSortableElement
            key={q.id}
            index={index}
            value={q}
            currIndex={index}
            isSavingDisplayOrder={isSavingDisplayOrder}
          />
        ))}
      </ul>
    );
  },
);

class SurveyQuestions extends React.Component<Props, State> {
  uh = new UnmountHelper();

  state: State = {
    isFetching: false,
    errorMsg: '',
    questions: [],
    isSavingDisplayOrder: false,
    savingErrorMsg: '',
  };

  onSortEnd = (sortEnd: SortEnd) => {
    // console.log('onSortEnd', sortEnd);

    const { oldIndex, newIndex } = sortEnd;
    const survey = this.props.currentSurvey.survey!;

    if (oldIndex !== newIndex) {
      const questions = arrayMove(this.state.questions, oldIndex, newIndex);
      this.setState({
        isSavingDisplayOrder: true,
        savingErrorMsg: '',
        questions,
      });
      this.uh
        .wrap(
          api.events.exec('setSurveyQuestionsSortOrder', {
            surveyId: survey.id,
            questionIDs: questions.map(q => q.id),
            __delay: 0,
            __genErr: false,
          }),
        )
        .then(({ err, results }) => {
          this.setState({ isSavingDisplayOrder: false });

          if (err) {
            this.setState({
              savingErrorMsg: err.message,
              questions: this.getInitialQuestions(),
            });
          } else {
            this.setState({
              questions: this.state.questions.map((q, index) => ({
                ...q,
                displayOrder: index,
              })),
            });
            this.props.currentSurveyActions.questionsReordered(
              oldIndex,
              newIndex,
            );
          }
        });
    }
  };

  getInitialQuestions(): SurveyQuestionInfo[] {
    const { survey } = this.props.currentSurvey;
    if (survey && survey.questions) {
      return survey.questions.slice();
    }

    return [];
  }

  componentDidMount(): void {
    this.uh.onMount();

    document.title = 'Вопросы анкеты';

    this.setState({
      questions: this.getInitialQuestions(),
    });
  }

  componentWillUnmount(): void {
    this.uh.onUnmount();
  }

  render() {
    const {
      isFetching,
      errorMsg,
      questions,
      isSavingDisplayOrder,
      savingErrorMsg,
    } = this.state;

    return (
      <div className="container">
        <VEFetchingSpinner isFetching={isFetching} />
        <VEFetchError msg={errorMsg} />
        <VEFetchError
          msg={savingErrorMsg}
          onClose={() => this.setState({ savingErrorMsg: '' })}
          msgPrefix="Не удалось сохранить порядок следования вопросов"
        />
        {!isFetching && !errorMsg && (
          <div className="columns">
            {questions.length === 0 && (
              <div className="column is-12 has-text-centered">
                <p>Вопросов еще нет</p>
                <br />
                <Link
                  className="button is-primary is-outlined"
                  to={`/public-event-survey/${
                    this.props.currentSurvey.survey!.id
                  }/new-question`}
                >
                  Создать
                </Link>
              </div>
            )}
            {questions.length > 0 && (
              <div className="column is-12">
                <QuestionsSortableContainer
                  items={questions}
                  onSortEnd={this.onSortEnd}
                  useDragHandle={true}
                  isSavingDisplayOrder={isSavingDisplayOrder}
                  shouldCancelStart={() => isSavingDisplayOrder}
                  lockAxis={'y'}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SurveyQuestions);
