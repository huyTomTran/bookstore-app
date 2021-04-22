export const server = 'http://localhost:5000';

export const webAPIUrl = `${server}/api`;

export const authSettings = {
  domain: 'dotnetbookstore.us.auth0.com',
  client_id: '3iZzNlYHJnfNcnuFDfSvGo2VWwvXKczy',
  redirect_uri: window.location.origin + '/signin-callback',
  scope: 'openid profile QandAAPI email',
  audience: 'https://dotnetbookstore',
};
