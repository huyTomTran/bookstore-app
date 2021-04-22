/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { gray3, gray6 } from './Styles';
import { Page } from './Page';
import { RouteComponentProps } from 'react-router-dom';
import {
  QuestionData,
  getQuestion,
  postAnswer,
  mapQuestionFromServer,
  QuestionDataFromServer,
} from './QuestionsData';
import { FC, useState, Fragment, useEffect } from 'react';
import { AnswerList } from './AnswerList';
import { Form, required, minLength, Values } from './Form';
import { Field } from './Field';
// import { connect } from 'react-redux';
// import { ThunkDispatch } from 'redux-thunk';
// import { AnyAction } from 'redux';
// import {
//   getQuestionActionCreator,
//   AppState,
//   postAnswerActionCreator,
//   clearPostedAnswerActionCreator,
//   clearPostedQuestionActionCreator,
// } from './Store';
import {
  HubConnectionBuilder,
  HubConnectionState,
  HubConnection,
} from '@aspnet/signalr';
import { useAuth } from './Auth';

interface RouteParams {
  questionId: string;
}

export const QuestionPage: FC<RouteComponentProps<RouteParams>> = ({
  match,
}) => {
  const [question, setQuestion] = useState<QuestionData | null>(null);

  // create a function to setup the SingalR connection
  const setUpSignalRConnection = async (questionId: number) => {
    // setup connection to real-time SignalR API
    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5000/questionshub')
      .withAutomaticReconnect()
      .build();
    // handle Message function being called
    connection.on('Message', (message: string) => {
      console.log('Message', message);
    });
    // handle ReceiveQuestion function being called
    connection.on('ReceiveQuestion', (question: QuestionDataFromServer) => {
      console.log('ReceiveQuestion', question);
      setQuestion(mapQuestionFromServer(question));
    });
    // start the connection
    try {
      await connection.start();
    } catch (err) {
      console.log(err);
    }
    // subscribe to question by invoking 'connection' object to call SubsribeQuestion method in the SignalR hub on the server
    if (connection.state === HubConnectionState.Connected) {
      connection.invoke('SubscribeQuestion', questionId).catch((err: Error) => {
        return console.error(err.toString());
      });
    }
    // return the connection
    return connection;
  };

  //  Stopping the client connection
  const cleanUpSignalRConnection = async (
    questionId: number,
    connection: HubConnection,
  ) => {
    //  unsubscribe from the question
    //  As well as stopping the connection, we need to remove the handlers for the Message and ReceiveQuestion functions
    if (connection.state === HubConnectionState.Connected) {
      try {
        await connection.invoke('UnsubscribeQuestion', questionId);
      } catch (err) {
        return console.error(err.toString());
      }
      // stop the connection
      connection.off('Message');
      connection.off('ReceiveQuestion');
      connection.stop();
    } else {
      // stop the connection
      connection.off('Message');
      connection.off('ReceiveQuestion');
      connection.stop();
    }
  };

  useEffect(() => {
    //  use of "cancelled" variable to track whether the user has navigated away from the pageand don'tset any state if this is true
    let cancelled = false;
    const doGetQuestion = async (questionId: number) => {
      const foundQuestion = await getQuestion(questionId);
      if (!cancelled) {
        setQuestion(foundQuestion);
      }
    };

    let connection: HubConnection;
    if (match.params.questionId) {
      const questionId = Number(match.params.questionId);
      doGetQuestion(questionId);
      setUpSignalRConnection(questionId).then((con) => {
        connection = con;
      });
    }

    return function cleanUp() {
      cancelled = true;
      if (match.params.questionId) {
        const questionId = Number(match.params.questionId);
        cleanUpSignalRConnection(questionId, connection);
      }
    };
  }, [match.params.questionId]);

  //  implement submit handler which will call postAnswer() function
  //  'NON-NULL ASSERTION OPERATOR(!)' in question!.questionId tells the TypeScript compiler that "question" cannot be null or underdefined
  const handleSubmit = async (values: Values) => {
    const result = await postAnswer({
      questionId: question!.questionId,
      content: values.content,
      userName: 'Fred',
      created: new Date(),
    });
    return { success: result ? true : false };
  };

  //  only allowing autheticated users to answer a question
  const { isAuthenticated } = useAuth();

  return (
    <Page>
      <div
        css={css`
          background-color: white;
          padding: 15px 20px 20px 20px;
          border-radius: 4px;
          border: 1px solid ${gray6};
          box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.16);
        `}
      >
        <div
          css={css`
            font-size: 19px;
            font-weight: bold;
            margin: 10px 0px 5px;
          `}
        >
          {question === null ? '' : question.title}
        </div>
        {question !== null && (
          <Fragment>
            <p
              css={css`
                margin-top: 0px;
                background-color: lightgoldenrodyellow;
                border-radius: 4px;
              `}
            >
              {question.content}
            </p>
            <div
              css={css`
                font-size: 12px;
                font-style: italic;
                color: ${gray3};
              `}
            >
              {`Asked by ${question.userName} on
              ${question.created.toLocaleDateString()}
              ${question.created.toLocaleTimeString()}
              `}
            </div>
            <AnswerList data={question.answers} />
            {isAuthenticated && (
              <div
                css={css`
                  margin-top: 20px;
                `}
              >
                <Form
                  submitCaption="Sumbmit Your Answer"
                  validationRules={{
                    content: [
                      { validator: required },
                      { validator: minLength, arg: 50 },
                    ],
                  }}
                  onSubmit={handleSubmit}
                  failureMessage="There was a problem with your answer"
                  successMessage="Your answer was successfully submitted"
                >
                  <Field name="content" label="Your Answer" type="TextArea" />
                </Form>
              </div>
            )}
          </Fragment>
        )}
      </div>
      {/* Question Page {match.params.questionId} */}
    </Page>
  );
};

//  This maps state from the store into the component props
// const mapStateToProps = (store: AppState) => {
//   return {
//     question: store.questions.viewing,
//     questionLoading: store.questions.loading,
//     postedAnswerResult: store.questions.postedAnswerResult,
//   };
// };
// //  This dispatches and maps the action creator to get question & post answer into the component props
// const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
//   return {
//     getQuestion: (questionId: number) =>
//       dispatch(getQuestionActionCreator(questionId)),
//     postAnswer: (answer: PostAnswerData) =>
//       dispatch(postAnswerActionCreator(answer)),
//     clearPostedAnswer: () => dispatch(clearPostedAnswerActionCreator()),
//   };
// };
// //  this connects the component to our store, and also invokes 2 mapper functions
// //  mapStateToProps and mapDispatchToProps which map the state & action creators from the store into the component props
// export default connect(mapStateToProps, mapDispatchToProps)(QuestionPage);
