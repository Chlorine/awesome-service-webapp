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

import { RootState } from '../../../store';
import { Actions as CurrentSurveyActions } from '../../../actions/current-survey';
import { SurveyQuestionInfo } from '../../../back/common/public-events/survey-question';
import { UnmountHelper } from '../../../utils/unmount-helper';
import {
  VEDescriptionAsSubtitle,
  VEFetchError,
  VEFetchingSpinner,
  VEPageSecondaryTitle,
} from '../../Common/ViewElements';

import { ANSWER_TYPE_NAMES } from './QuestionHelpers';

import './SurveyQuestions.scss';

const mapStateToProps = (state: RootState) => {
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
  sortingInProgress: boolean;
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
  showDragHandle: boolean;
  sortingInProgress: boolean;
};

const QuestionSortableElement = SortableElement(
  ({
    value,
    currIndex,
    isSavingDisplayOrder,
    showDragHandle,
    sortingInProgress,
  }: QuestionSortableElementProps) => {
    const { id, text, description, answerType } = value;

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
            </div>
            {showDragHandle && (
              <div
                className="media-right has-tooltip-arrow has-tooltip-left"
                data-tooltip={sortingInProgress ? undefined : 'Переместить'}
              >
                <QuestionDragHandle
                  isSavingDisplayOrder={isSavingDisplayOrder}
                />
              </div>
            )}
          </article>
        </div>
      </li>
    );
  },
);

declare type QuestionsSortableContainerProps = {
  items: SurveyQuestionInfo[];
  isSavingDisplayOrder: boolean;
  sortingInProgress: boolean;
};

const QuestionsSortableContainer = SortableContainer(
  ({
    items,
    isSavingDisplayOrder,
    sortingInProgress,
  }: QuestionsSortableContainerProps) => {
    return (
      <ul className="ul-sortable-container">
        {items.map((q, index) => (
          <QuestionSortableElement
            key={q.id}
            index={index}
            value={q}
            currIndex={index}
            isSavingDisplayOrder={isSavingDisplayOrder}
            showDragHandle={items.length > 1}
            sortingInProgress={sortingInProgress}
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
    sortingInProgress: false,
  };

  onSortEnd = (sortEnd: SortEnd) => {
    // console.log('onSortEnd', sortEnd);

    this.setState({ sortingInProgress: false });

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
                <p className="has-text-grey"> Вопросов еще нет</p>
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
                  onSortStart={() => this.setState({ sortingInProgress: true })}
                  onSortEnd={this.onSortEnd}
                  useDragHandle={true}
                  isSavingDisplayOrder={isSavingDisplayOrder}
                  shouldCancelStart={() => isSavingDisplayOrder}
                  lockAxis={'y'}
                  sortingInProgress={this.state.sortingInProgress}
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
