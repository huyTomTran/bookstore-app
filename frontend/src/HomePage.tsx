/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { PrimaryButton } from './Styles';
import { QuestionList } from './QuestionList';
import { getUnansweredQuestions, QuestionData } from './QuestionsData';
import { Page } from './Page';
import { PageTitle } from './PageTitle';
import { useEffect, useState, FC } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useAuth } from './Auth';
/* import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { getUnansweredQuestionsActionCreator, AppState } from './Store';*/

// const renderQuestion = (question: QuestionData) => <div>{question.title}</div>;

/* //  create a props interface in order to access the state in the Redux store, as well as dispatched action creator
//  We have added three props for getting and storing the unanswered questions, as well as for whether they are in the process of being loaded
interface Props extends RouteComponentProps {
  getUnansweredQuestions: () => Promise<void>;
  questions: QuestionData[] | null;
  questionsLoading: boolean;
} */

export const HomePage: FC<RouteComponentProps> = ({ history }) => {
  //  destructured the array that's returned from
  //  'useState' into a state variable called 'questions', which is initially null,
  //  and a function to set the state called 'setQuestions'
  const [questions, setQuestions] = useState<QuestionData[] | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  //  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // console.log('first rendered');
    /* //  get the unanswered questions when the component is mounted
    if (questions === null) {
      getUnansweredQuestions();
    } */

    // create a function that calls 'getUnansweredQuestions' asynchronously and call this function within the useEffect callback function
    const doGetUnasweredQuestions = async () => {
      const unansweredQuestions = await getUnansweredQuestions();
      if (!cancelled) {
        // set the 'questions' and 'questionsLoading' states when we have retrieved the data
        setQuestions(unansweredQuestions);
        setQuestionsLoading(false);
      }
    };
    doGetUnasweredQuestions();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAskQuestionClick = () => {
    // setCount(count + 1);
    // console.log('TODO - move to the AskPage');
    history.push('/ask');
  };

  const { isAuthenticated } = useAuth();

  // console.log('rendered');
  return (
    <Page>
      {/* <div
        css={css`
          margin: 50px auto 20px auto;
          padding: 30px 20px;
          max-width: 600px;
        `}
      > */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
        `}
      >
        {/* <h2
            css={css`
              font-size: 15px;
              font-weight: bold;
              margin: 10px 0px 5px;
              text-align: center;
              text-transform: uppercase;
            `}
          > */}
        <PageTitle>Unanswered Questions</PageTitle>
        {/* </h2> */}
        {isAuthenticated && (
          <PrimaryButton onClick={handleAskQuestionClick}>
            Ask a question
          </PrimaryButton>
        )}
      </div>
      {questionsLoading ? (
        <div
          css={css`
            font-size: 16px;
            font-style: italic;
          `}
        >
          Loading...
        </div>
      ) : (
        <QuestionList
          data={questions || []}
          // renderItem={renderQuestion}
        />
      )}
      {/* </div> */}
    </Page>
  );
};

/* //  This maps state from the store into the component props
const mapStateToProps = (store: AppState) => {
  return {
    questions: store.questions.unanswered,
    questionsLoading: store.questions.loading,
  };
};
//  This dispatches and maps the action creator to get unanswered questions into the component props
const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
  return {
    getUnansweredQuestions: () =>
      dispatch(getUnansweredQuestionsActionCreator()),
  };
};
//  this connects the component to our store, and also invokes 2 mapper functions
//  mapStateToProps and mapDispatchToProps which map the state & action creators from the store into the component props
export default connect(mapStateToProps, mapDispatchToProps)(HomePage); */
