//  implement a central authentication context that contains states and functions for authentication
//  so that our app components will use to get access to authentication-related information

import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  FC,
} from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { authSettings } from './AppSettings';

interface Auth0User {
  name: string;
  email: string;
}
interface IAuth0Context {
  isAuthenticated: boolean;
  user?: Auth0User;
  signIn: () => void;
  signOut: () => void;
  loading: boolean;
}
export const Auth0Context = createContext<IAuth0Context>({
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
  loading: true,
});

export const useAuth = () => useContext(Auth0Context);

export const AuthProvider: FC = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Auth0User | undefined>(undefined);
  const [auth0Client, setAuth0Client] = useState<Auth0Client>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth0 = async () => {
      setLoading(true);
      const auth0FromHook = await createAuth0Client(authSettings);
      //{
      //  domain: 'dotnetbookstore.us.auth0.com',
      //  client_id: '3iZzNlYHJnfNcnuFDfSvGo2VWwvXKczy',
      // redirect_uri: window.location.origin + '/signin-callback',
      //  scope: 'openid profile QandAAPI email',
      //  audience: 'https://dotnetbookstore',
      //}
      setAuth0Client(auth0FromHook);

      if (
        window.location.pathname === '/signin-callback' &&
        window.location.search.indexOf('code=') > -1
      ) {
        //  call the Auth0 client handleRedirectCallback function, which
        //  will parse the URL, extract the code, and store it in a variable internally
        await auth0FromHook.handleRedirectCallback();
        //  redirect the user to the home page after this has been completed
        window.location.replace(window.location.origin);
      }

      const isAuthenticatedFromHook = await auth0FromHook.isAuthenticated();
      if (isAuthenticatedFromHook) {
        const user = await auth0FromHook.getUser();
        setUser(user);
      }
      setIsAuthenticated(isAuthenticatedFromHook);
      setLoading(false);
    };
    initAuth0();
  }, []);

  const getAuth0ClientFromState = () => {
    if (auth0Client === undefined) {
      throw new Error('Auth0 client not set');
    }
    return auth0Client;
  };

  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        signIn: () => getAuth0ClientFromState().loginWithRedirect(),
        signOut: () =>
          getAuth0ClientFromState().logout({
            client_id: authSettings.client_id,
            returnTo: window.location.origin + '/signout-callback',
          }),
        loading,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};

//  "getTokenSilently" function make a request to the Auth0 token endpoint to get the access token securely
export const getAccessToken = async () => {
  const auth0FromHook = await createAuth0Client(authSettings);
  const accessToken = await auth0FromHook.getTokenSilently();
  return accessToken;
};
