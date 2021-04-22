import {
  QuestionData,
  getUnansweredQuestions,
  postQuestion,
  PostQuestionData,
  AnswerData,
  getQuestion,
  searchQuestions,
  PostAnswerData,
  postAnswer,
} from './QuestionsData';
import {
  Action,
  ActionCreator,
  Dispatch,
  Reducer,
  combineReducers,
  Store,
  createStore,
  applyMiddleware,
} from 'redux';
import thunk, { ThunkAction } from 'redux-thunk';

// *********************** CREATING THE STATE ***********************
// create TypeScript types for the state of our store
interface QuestionsState {
  readonly loading: boolean;
  readonly unanswered: QuestionData[] | null;
  readonly postedResult?: QuestionData;
  readonly viewing: QuestionData | null;
  readonly searched: QuestionData[] | null;
  readonly postedAnswerResult?: AnswerData;
}

export interface AppState {
  readonly questions: QuestionsState;
}

//  define the initial state for the store with
//  an empty array of unanswered questions and doesn't load questions from the server
const initialQuestionsState: QuestionsState = {
  loading: false,
  unanswered: null,
  viewing: null,
  searched: null,
};

//  *********************** CREATING ACTIONS ***********************
//  create an action for when unanswered questions that are being fetched from the server
//  this action contains 1 property: 'type' property
interface GettingUnansweredQuestionsAction
  extends Action<'GettingUnansweredQuestions'> {}

//  create an action for when the unanswered questions have been retrieved from the server
//  this action contains 2 properties: fixed 'type' property & 'questions' property
export interface GotUnansweredQuestionsAction
  extends Action<'GotUnansweredQuestions'> {
  questions: QuestionData[];
}

//  create an action is for when a question has been posted to the server and we have the response
export interface PostedQuestionAction extends Action<'PostedQuestion'> {
  result: QuestionData | undefined;
}

interface GettingQuestionAction extends Action<'GettingQuestion'> {}

export interface GotQuestionAction extends Action<'GotQuestion'> {
  question: QuestionData | null;
}

interface SearchingQuestionsAction extends Action<'SearchingQuestions'> {}

export interface SearchedQuestionsAction extends Action<'SearchedQuestions'> {
  questions: QuestionData[];
}

export interface PostedQuestionAction extends Action<'PostedQuestion'> {
  result: QuestionData | undefined;
}

export interface PostedAnswerAction extends Action<'PostedAnswer'> {
  questionId: number;
  result: AnswerData | undefined;
}

//  combine all the action types in a union type for 'reducer' implementation
type QuestionsActions =
  | GettingUnansweredQuestionsAction
  | GotUnansweredQuestionsAction
  | PostedQuestionAction
  | GettingQuestionAction
  | GotQuestionAction
  | SearchingQuestionsAction
  | SearchedQuestionsAction
  | PostedAnswerAction;

//  *********************** CREATING ACTION CREATORS ***********************
//  implement action creator which will gather unanswered questions
export const getUnansweredQuestionsActionCreator: ActionCreator<ThunkAction<
  Promise<void>,
  QuestionData[],
  null,
  GotUnansweredQuestionsAction
>> = () => {
  return async (dispatch: Dispatch) => {
    // dispatch the GettingUnansweredQuestions action
    const gettingUnansweredQuestionsAction: GettingUnansweredQuestionsAction = {
      type: 'GettingUnansweredQuestions',
    };
    dispatch(gettingUnansweredQuestionsAction);
    // get the questions from server
    const questions = await getUnansweredQuestions();
    // dispatch the GotUnansweredQuestions action
    const gotUnansweredQuestionsAction: GotUnansweredQuestionsAction = {
      questions,
      type: 'GotUnansweredQuestions',
    };
    dispatch(gotUnansweredQuestionsAction);
  };
};

//  implementing an action creator for posting a question
export const postQuestionActionCreator: ActionCreator<ThunkAction<
  Promise<void>,
  QuestionData,
  PostQuestionData,
  PostedQuestionAction
>> = (question: PostQuestionData) => {
  return async (dispatch: Dispatch) => {
    const result = await postQuestion(question);
    const postedQuestionAction: PostedQuestionAction = {
      type: 'PostedQuestion',
      result,
    };
    dispatch(postedQuestionAction);
  };
};

//  implementing an action creator for clearing the posted question
//  this action creator is a SYNCHRONOUS function
export const clearPostedQuestionActionCreator: ActionCreator<PostedQuestionAction> = () => {
  const postedQuestionAction: PostedQuestionAction = {
    type: 'PostedQuestion',
    result: undefined,
  };
  return postedQuestionAction;
};

export const getQuestionActionCreator: ActionCreator<ThunkAction<
  Promise<void>,
  QuestionData,
  null,
  GotQuestionAction
>> = (questionId: number) => {
  return async (dispatch: Dispatch) => {
    const gettingQuestionAction: GettingQuestionAction = {
      type: 'GettingQuestion',
    };
    dispatch(gettingQuestionAction);
    const question = await getQuestion(questionId);
    const gotQuestionAction: GotQuestionAction = {
      question,
      type: 'GotQuestion',
    };
    dispatch(gotQuestionAction);
  };
};

export const searchQuestionsActionCreator: ActionCreator<ThunkAction<
  Promise<void>,
  QuestionData[],
  null,
  SearchedQuestionsAction
>> = (criteria: string) => {
  return async (dispatch: Dispatch) => {
    const searchingQuestionsAction: SearchingQuestionsAction = {
      type: 'SearchingQuestions',
    };
    dispatch(searchingQuestionsAction);
    const questions = await searchQuestions(criteria);
    const searchedQuestionsAction: SearchedQuestionsAction = {
      questions,
      type: 'SearchedQuestions',
    };
    dispatch(searchedQuestionsAction);
  };
};

export const postAnswerActionCreator: ActionCreator<ThunkAction<
  Promise<void>,
  AnswerData,
  PostAnswerData,
  PostedAnswerAction
>> = (answer: PostAnswerData) => {
  return async (dispatch: Dispatch) => {
    const result = await postAnswer(answer);
    const postedAnswerAction: PostedAnswerAction = {
      type: 'PostedAnswer',
      questionId: answer.questionId,
      result,
    };
    dispatch(postedAnswerAction);
  };
};

// export const clearPostedAnswerActionCreator: ActionCreator<PostedAnswerAction> = () => {
//   const postedAnswerAction: PostedAnswerAction = {
//     type: 'PostedAnswer',
//     questionId: 0,
//     result: undefined,
//   };
//   return postedAnswerAction;
// };

//  *********************** CREATING REDUCERS ***********************
//  the state will be "undefined" for the first time the reducer is called
const questionsReducer: Reducer<QuestionsState, QuestionsActions> = (
  state = initialQuestionsState,
  action,
) => {
  // Handle different actions and return new state
  switch (action.type) {
    case 'GettingUnansweredQuestions': {
      return {
        ...state,
        unanswered: null,
        loading: true,
      };
    }
    case 'GotUnansweredQuestions': {
      return {
        ...state,
        unanswered: action.questions,
        loading: false,
      };
    }
    // If the question has been successfully submitted, the 'result' property in the 'action' will contain a 'question' property,
    // which is added to the array using the array's concat function. We store the result of the question submission in the 'postedResult' property
    case 'PostedQuestion': {
      return {
        ...state,
        unanswered: action.result
          ? (state.unanswered || []).concat(action.result)
          : state.unanswered,
        postedResult: action.result,
      };
    }
    case 'GettingQuestion': {
      return {
        ...state,
        viewing: null,
        loading: true,
      };
    }
    case 'GotQuestion': {
      return {
        ...state,
        viewing: action.question,
        loading: false,
      };
    }
    case 'SearchingQuestions': {
      return {
        ...state,
        searched: null,
        loading: true,
      };
    }
    case 'SearchedQuestions': {
      return {
        ...state,
        searched: action.questions,
        loading: true,
      };
    }
    case 'PostedAnswer': {
      return {
        ...state,
        unanswered: action.result
          ? (state.unanswered || []).filter(
              (q) => q.questionId !== action.questionId,
            )
          : state.unanswered,
        postedAnswerResult: action.result,
      };
    }
    default:
      neverReached(action);
  }
  return state;
};

//  implement neverReached() function that takes in a parameter that is of the never type
//  and returns an empty object
const neverReached = (never: never) => {};

//  use combineReducer() function in Redux to combine all our reducers into a single reducer that returns AppState
//  We only have a single property in our app state called 'questions' and a single reducer managing changes to that state called "questionsReducer"
const rootReducer = combineReducers<AppState>({
  questions: questionsReducer,
});

//  create a function to create the store
export function configureStore(): Store<AppState> {
  const store = createStore(rootReducer, undefined, applyMiddleware(thunk));
  return store;
}
