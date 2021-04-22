/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { FC, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Page } from './Page';
import { QuestionList } from './QuestionList';
import { searchQuestions, QuestionData } from './QuestionsData';
/* import { ThunkDispatch } from 'redux-thunk';
import { searchQuestionsActionCreator, AppState } from './Store';
import { connect } from 'react-redux';
import { AnyAction } from 'redux'; */

/* interface Props extends RouteComponentProps {
  searchQuestions: (criteria: string) => Promise<void>;
  questions: QuestionData[] | null;
  questionLoading: boolean;
} */

// get 'criteria' query parameter from the browser
export const SearchPage: FC<RouteComponentProps> = ({ location }) => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get('criteria') || '';

  useEffect(() => {
    //  use of "cancelled" variable to track whether the user has navigated away from the pageand don'tset any state if this is true
    let cancelled = false;
    const doSearch = async (criteria: string) => {
      const foundResults = await searchQuestions(criteria);
      if (!cancelled) {
        setQuestions(foundResults);
      }
    };
    doSearch(search);
    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <Page title="Search Results">
      {search && (
        <p
          css={css`
            font-size: 16px;
            font-style: italic;
            margin-top: 0px;
            box-sizing: border-box;
            padding: 8px 10px;
            border: 1px solid lightgray;
            border-radius: 18px;
            text-align: center;
            background-color: white;
            width: 600px;
            height: 30px;
          `}
        >
          for "{search}"
        </p>
      )}
      <QuestionList data={questions} />
    </Page>
  );
};

/* const mapStateToProps = (store: AppState) => {
  return {
    questions: store.questions.searched,
    questionLoading: store.questions.loading,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
  return {
    searchQuestions: (criteria: string) =>
      dispatch(searchQuestionsActionCreator(criteria)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage); */
