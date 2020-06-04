import { produce, Draft } from 'immer';

import { ActionType } from '../actions/current-survey';
import { CurrentSurveyState } from '../store/state';
import { SurveyInfo } from '../back/common/public-events/survey';
import arrayMove from 'array-move';

const initialState: CurrentSurveyState = {
  survey: null,
};

const _checkSurvey = (survey: SurveyInfo | null, action: ActionType): void => {
  if (!survey)
    throw new Error(
      `Survey is missing, cannot perform action '${action.type}'`,
    );

  if (!survey.questions)
    throw new Error(
      `Survey questions are missing, cannot perform action '${action.type}'`,
    );
};

export const currentSurveyReducer = produce(
  (draft: Draft<CurrentSurveyState> = initialState, action: ActionType) => {
    switch (action.type) {
      case '@currentSurvey/infoLoaded':
        {
          const { survey } = action;
          if (!survey.questions) {
            survey.questions = [];
          }
          draft.survey = survey;
        }
        break;
      case '@currentSurvey/infoReset':
        draft.survey = null;

        break;
      case '@currentSurvey/questionCreated':
        _checkSurvey(draft.survey, action);
        draft.survey!.questions!.push(action.question);

        break;
      case '@currentSurvey/questionsReordered':
        {
          _checkSurvey(draft.survey, action);

          const { oldIndex, newIndex } = action;
          const questions = draft.survey!.questions!;

          if (!questions[oldIndex]) {
            throw new Error(
              `Cannot perform '${action.type}': invalid oldIndex`,
            );
          }
          if (!questions[newIndex]) {
            throw new Error(
              `Cannot perform '${action.type}': invalid newIndex`,
            );
          }

          draft.survey!.questions = arrayMove(questions, oldIndex, newIndex);
        }
        break;
    }

    return draft;
  },
);
