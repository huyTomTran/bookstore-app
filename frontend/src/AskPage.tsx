import React, { FC, useEffect } from 'react';
import { Page } from './Page';
import { Form, required, minLength, Values, SubmitResult } from './Form';
import { Field } from './Field';
import { PostQuestionData, QuestionData } from './QuestionsData';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import {
  postQuestionActionCreator,
  AppState,
  clearPostedQuestionActionCreator,
} from './Store';

interface Props {
  postQuestion: (question: PostQuestionData) => Promise<void>;
  postedQuestionResult?: QuestionData;
  clearPostedQuestion: () => void;
}

const AskPage: FC<Props> = ({
  postQuestion,
  postedQuestionResult,
  clearPostedQuestion,
}) => {
  useEffect(() => {
    return function cleanUp() {
      clearPostedQuestion();
    };
  }, [clearPostedQuestion]);

  //  implement submit handler which will call postQuestion() dispatched action creator from the store
  const handleSubmit = (values: Values) => {
    postQuestion({
      title: values.title,
      content: values.content,
      userName: 'Fred',
      created: new Date(),
    });
  };

  //  construct the submitResult variable we have just referenced from the properties in postedQuestionResult
  let submitResult: SubmitResult | undefined;
  if (postedQuestionResult) {
    submitResult = { success: postedQuestionResult !== undefined };
  }

  return (
    <Page title="Ask a question">
      <Form
        submitCaption="Submit Your Question"
        validationRules={{
          title: [{ validator: required }, { validator: minLength, arg: 10 }],
          content: [{ validator: required }, { validator: minLength, arg: 50 }],
        }}
        onSubmit={handleSubmit}
        submitResult={submitResult}
        failureMessage="There was a problem with your question"
        successMessage="Your question was succesfully submitted"
      >
        <Field name="title" label="Title" />
        <Field name="content" label="Content" type="TextArea" />
      </Form>
    </Page>
  );
};

//  This maps state from the store into the component props
const mapStateToProps = (store: AppState) => {
  return {
    postedQuestionResult: store.questions.postedResult,
  };
};
//  This dispatches and maps the action creator to post the question into the component props
const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
  return {
    postQuestion: (question: PostQuestionData) =>
      dispatch(postQuestionActionCreator(question)),
    clearPostedQuestion: () => dispatch(clearPostedQuestionActionCreator()),
  };
};
//  this connect the AskPage component to our Redux store
export default connect(mapStateToProps, mapDispatchToProps)(AskPage);
