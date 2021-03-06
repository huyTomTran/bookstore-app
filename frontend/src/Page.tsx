/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { FC } from 'react';
import { PageTitle } from './PageTitle';

interface Props {
  title?: string;
}

// we didn't need to define children in our Props interface.
// This is because it's already been made available via the FC type.
export const Page: FC<Props> = ({ title, children }) => (
  <div
    css={css`
      margin: 50px auto 20px auto;
      padding: 30px 20px;
      max-width: 600px;
    `}
  >
    {title && <PageTitle>{title}</PageTitle>}
    {children}
  </div>
);
