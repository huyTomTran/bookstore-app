/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { FC } from 'react';
import { QuestionData } from './QuestionsData';
import { gray2, gray3 } from './Styles';
import { Link } from 'react-router-dom';

interface Props {
  data: QuestionData;
  showContent?: boolean; //  THE "?" makes 'showContent' prop OPTIONAL
}

export const Question: FC<Props> = ({ data, showContent = true }) => (
  <div
    css={css`
      padding: 10px 0px;
    `}
  >
    <div
      css={css`
        padding: 10px 0px;
        font-size: 19px;
      `}
    >
      <Link
        css={css`
          text-decoration: none;
          color: ${gray2};
        `}
        to={`questions/${data.questionId}`}
      >
        {data.title}
      </Link>
    </div>
    {showContent && (
      <div
        css={css`
          padding-bottom: 10px;
          font-size: 15px;
          color: ${gray2};
        `}
      >
        {/* /* ternary operator is used to truncate the content if it is longer than 50 characters */}
        {data.content.length > 50
          ? `${data.content.substring(0, 50)}...`
          : data.content}
      </div>
    )}
    <div
      css={css`
        font-size: 12px;
        font-style: italic;
        color: ${gray3};
      `}
    >
      {`Asked by ${data.userName} on
        ${data.created.toLocaleDateString()} ${data.created.toLocaleTimeString()}`}
    </div>
  </div>
);

// this is another way to define default values for 'showContent
// Question.defaultProps = {
//   showContent: true,
// };
