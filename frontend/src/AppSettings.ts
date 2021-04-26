export const server =
  process.env.REACT_APP_ENV === 'production'
    ? 'https://worldofqanda.azurewebsites.net'
    : process.env.REACT_APP_ENV === 'staging'
    ? 'https://worldofqanda-staging.azurewebsites.net'
    : 'http://localhost:5000';

export const webAPIUrl = `${server}/api`;

export const authSettings = {
  domain: 'dotnetbookstore.us.auth0.com',
  client_id: '3iZzNlYHJnfNcnuFDfSvGo2VWwvXKczy',
  redirect_uri: window.location.origin + '/signin-callback',
  scope: 'openid profile QandAAPI email',
  audience: 'https://dotnetbookstore',
};
