//  ************** Implementing the sign-in process **************

import React, { FC } from 'react';
import { Page } from './Page';
import { StatusText } from './Styles';
import { useAuth } from './Auth';

//  define Props type for the page component
type SigninAction = 'signin' | 'signin-callback';

//  the component takes in an 'action' prop that gives the current stage of the sign-in process
interface Props {
  action: SigninAction;
}

//  implement the SignInPage component
export const SignInPage: FC<Props> = ({ action }) => {
  //  get signIn function from the authentication context
  const { signIn } = useAuth();

  if (action === 'signin') {
    signIn();
  }

  //  render the page informing the user that the sign-in process is taking place
  return (
    <Page title="Sign In">
      <StatusText>Signing in...</StatusText>
    </Page>
  );
};
