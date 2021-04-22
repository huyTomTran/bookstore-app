import { http } from './http';
import { getAccessToken } from './Auth';

export interface QuestionData {
  questionId: number;
  title: string;
  content: string;
  userName: string;
  created: Date;
  answers: AnswerData[];
}

export interface AnswerData {
  answerId: number;
  content: string;
  userName: string;
  created: Date;
}

export interface QuestionDataFromServer {
  questionId: number;
  title: string;
  content: string;
  userName: string;
  created: Date;
  answers: AnswerData[];
}

export const mapQuestionFromServer = (
  question: QuestionDataFromServer,
): QuestionData => ({
  ...question,
  created: new Date(question.created),
  answers: question.answers
    ? question.answers.map((answer) => ({
        ...answer,
        created: new Date(answer.created),
      }))
    : [],
});

// // properly model the data that is received from the web server
// export interface QuestionDataFromServer {
//   questionId: number;
//   title: string;
//   content: string;
//   userName: string;
//   created: string;
//   answers: AnswerDataFromServer[];
// }

// // properly model the data that is received from the web server
// export interface AnswerDataFromServer {
//   answerId: number;
//   content: string;
//   userName: string;
//   created: string;
// }

// //   map a question that comes from the server into the format our front-end expect to work with
// export const mapQuestionFromServer = (
//   question: QuestionDataFromServer,
// ): QuestionData => ({
//   ...question,
//   created: new Date(question.created.substr(0, 19)),
//   answers: question.answers.map((answer) => ({
//     ...answer,
//     created: new Date(answer.created.substr(0, 19)),
//   })),
// });

/* const questions: QuestionData[] = [
  {
    questionId: 1,
    title: 'Why should I learn TypeScript?',
    content:
      'TypeScript seems to be getting popular so I wondered whether it is worth my time learning it? What benefits does it give over JavaScript?',
    userName: 'Bob',
    created: new Date(),
    answers: [
      {
        answerId: 1,
        content: 'To catch problems earlier speeding up yourdevelopments',
        userName: 'Jane',
        created: new Date(),
      },
      {
        answerId: 2,
        content:
          'So, that you can use the JavaScript features of tomorrow, today',
        userName: 'Fred',
        created: new Date(),
      },
    ],
  },
  {
    questionId: 2,
    title: 'Which state management tool should I use?',
    content:
      'There seem to be a fair few state management tools around for React - React, Unstated, ...Which one should I use ? ',
    userName: 'Bob',
    created: new Date(),
    answers: [],
  },
]; */

//  create asynchronous 'wait' function that we can use in our getUnansweredQuestions function
//  this function returns a Promise object
//  We are passing a <void> type into the generic Promise type
//  const wait = (ms: number): Promise<void> => {
//  return new Promise((resolve) => setTimeout(resolve, ms));
//  };

//  getting unanswered questions from the REST API
export const getUnansweredQuestions = async (): Promise<QuestionData[]> => {
  try {
    //  pass undefined into the http function as the 'request body' type because there isn't one
    //  and QuestionDataFromServer[] as the expected 'response body' type
    const result = await http<undefined, QuestionDataFromServer[]>({
      path: '/questions/unanswered',
    });
    if (result.parsedBody) {
      return result.parsedBody.map(mapQuestionFromServer);
    } else {
      return [];
    }
  } catch (ex) {
    console.error(ex);
    return [];
  }
};
// // use of 'wait' function to make getUnansweredQuestions wait half a second
// // So, the getUnansweredQuestions function is now asynchronous
// export const getUnansweredQuestions = async (): Promise<QuestionData[]> => {
//   //  await wait(500);
//   //  return questions.filter((q) => q.answers.length === 0);
//   let unansweredQuestions: QuestionData[] = [];
//   //  call api/questions/unanswered
//   await fetch('http://localhost:5000/api/questions/unanswered')
//     //  interact with items in the response body
//     .then((res) => res.json())
//     //  put response body in unansweredQuestions
//     .then((body) => {
//       unansweredQuestions = body;
//     })
//     //  catch any network errors
//     .catch((err) => {
//       console.error(err);
//     });
//   //  map the "created" property to a Date object;
//   //  because the "created" property is deserialized as a string, not a Date object like the Question component expects
//   return unansweredQuestions.map((question) => ({
//     ...question,
//     created: new Date(question.created),
//   }));
// };

//  searching questions with the REST API
export const searchQuestions = async (
  criteria: string,
): Promise<QuestionData[]> => {
  try {
    const result = await http<undefined, QuestionDataFromServer[]>({
      path: `/questions?search=${criteria}`,
    });
    if (result.ok && result.parsedBody) {
      return result.parsedBody.map(mapQuestionFromServer);
    } else {
      return [];
    }
  } catch (ex) {
    console.error(ex);
    return [];
  }
};
// export const searchQuestions = async (
//   criteria: string,
// ): Promise<QuestionData[]> => {
//   await wait(500);
//   return questions.filter(
//     (q) =>
//       q.title.toLowerCase().indexOf(criteria.toLowerCase()) >= 0 ||
//       q.content.toLowerCase().indexOf(criteria.toLowerCase()) >= 0,
//   );
// };

//  get a question from the REST API
export const getQuestion = async (
  questionId: number,
): Promise<QuestionData | null> => {
  // make the request
  try {
    const result = await http<undefined, QuestionDataFromServer>({
      path: `/questions/${questionId}`,
    });
    if (result.ok && result.parsedBody) {
      //  return response body with correctly typed dates if request is successful
      return mapQuestionFromServer(result.parsedBody);
    } else {
      //  return null if the request fails or there is a network error
      return null;
    }
  } catch (ex) {
    console.error(ex);
    return null;
  }
};
// export const getQuestion = async (
//   questionId: number,
// ): Promise<QuestionData | null> => {
//   await wait(500);
//   const results = questions.filter((q) => q.questionId === questionId);
//   return results.length === 0 ? null : results[0];
// };

export interface PostQuestionData {
  title: string;
  content: string;
  userName: string;
  created: Date;
}

//  this function simulate posting a question
// The function adds the question to the questions array using the Math.max() method to set questionId to the next number.
export const postQuestion = async (
  question: PostQuestionData,
): Promise<QuestionData | undefined> => {
  const accessToken = await getAccessToken();
  try {
    const result = await http<PostQuestionData, QuestionDataFromServer>({
      path: '/questions',
      method: 'post',
      body: question,
      accessToken,
    });
    if (result.ok && result.parsedBody) {
      return mapQuestionFromServer(result.parsedBody);
    } else {
      return undefined;
    }
  } catch (ex) {
    console.error(ex);
    return undefined;
  }
  //  await wait(500);
  //  const questionId = Math.max(...questions.map((q) => q.questionId)) + 1;
  //  const newQuestion: QuestionData = {
  //  ...question,
  //  questionId,
  //  answers: [],
  //  };
  //  questions.push(newQuestion);
  //  return newQuestion;
};

export interface PostAnswerData {
  questionId: number;
  content: string;
  userName: string;
  created: Date;
}

//  this function finds the question in the questions array and adds the answer to it
export const postAnswer = async (
  answer: PostAnswerData,
): Promise<AnswerData | undefined> => {
  const accessToken = await getAccessToken();
  try {
    const result = await http<PostAnswerData, AnswerData>({
      path: '/questions/answer',
      method: 'post',
      body: answer,
      accessToken,
    });
    if (result.ok) {
      return result.parsedBody;
    } else {
      return undefined;
    }
  } catch (ex) {
    console.error(ex);
    return undefined;
  }
};
