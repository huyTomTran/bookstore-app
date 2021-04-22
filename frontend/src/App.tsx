/** @jsx jsx */
import { css, jsx } from '@emotion/core';
// The css function is what we'll use to style an HTML element.
// The jsx function is used to transform the component into JavaScript by Babel.
// The comment above the import statement tells Babel to use this jsx function to transform JSX into JavaScript
import React, { lazy, Suspense } from 'react';
import { fontFamily, fontSize, gray2 } from './Styles';
import { HeaderWithRouter as Header } from './Header';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
// both HomePage and SearchPage are implemented with Redux & Redux Store
import { HomePage } from './HomePage';
import { SearchPage } from './SearchPage';
import { NotFoundPage } from './NotFoundPage';
import { QuestionPage } from './QuestionPage';
import { Provider } from 'react-redux';
import { configureStore } from './Store';
import { SignInPage } from './SignInPage';
import { SignOutPage } from './SignOutPage';
import { AuthProvider } from './Auth';
import { AuthorizedPage } from './AuthorizedPage';

// import { AskPage } from './AskPage';
// "lazy loading" AskPage
const AskPage = lazy(() => import('./AskPage'));

//  create an instance of the store using configureStore() function
const store = configureStore();

const MyApp: React.FC = () => {
  return (
    //  Adding a store provider which allows components lower in the tree to consume the store
    <AuthProvider>
      <Provider store={store}>
        <BrowserRouter>
          <div
            css={css`
              font-family: ${fontFamily};
              font-size: ${fontSize};
              color: ${gray2};
            `}
          >
            <Header />
            <Switch>
              <Redirect from="/home" to="/" />
              <Route exact path="/" component={HomePage} />
              <Route path="/search" component={SearchPage} />
              <Route path="/ask">
                <Suspense
                  fallback={
                    <div
                      css={css`
                        margin-top: 100px;
                        text-align: center;
                      `}
                    >
                      Loading...
                    </div>
                  }
                >
                  <AuthorizedPage>
                    <AskPage />
                  </AuthorizedPage>
                </Suspense>
              </Route>
              <Route
                path="/signin"
                render={() => <SignInPage action="signin" />}
              />
              <Route
                path="/signin-callback"
                render={() => <SignInPage action="signin-callback" />}
              />
              <Route
                path="/signout"
                render={() => <SignOutPage action="signout" />}
              />
              <Route
                path="/signout-callback"
                render={() => <SignOutPage action="signout-callback" />}
              />
              <Route path="/questions/:questionId" component={QuestionPage} />
              <Route component={NotFoundPage} />
            </Switch>
            {/* <HomePage /> */}
          </div>
        </BrowserRouter>
      </Provider>
    </AuthProvider>
  );
};

export default MyApp;
