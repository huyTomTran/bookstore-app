//  ******** this module create a generic http function that we will use to make all of our HTTP requests ********

import { webAPIUrl } from './AppSettings';

//  define interface for the request
export interface HttpRequest<REQB> {
  path: string;
  method?: string;
  body?: REQB;
  accessToken?: string;
}

//  define interface for the response
export interface HttpResponse<REQB> extends Response {
  parsedBody?: REQB;
}

//  implement generic http function from above interfaces
export const http = <REQB, RESB>(
  config: HttpRequest<REQB>,
): Promise<HttpResponse<RESB>> => {
  return new Promise((resolve, reject) => {
    // make the HTTP request
    const request = new Request(`${webAPIUrl}${config.path}`, {
      method: config.method || 'get',
      headers: {
        'Content-Type': 'application/json',
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
    });
    if (config.accessToken) {
      request.headers.set('authorization', `bearer ${config.accessToken}`);
    }
    let response: HttpResponse<RESB>;
    fetch(request)
      .then((res) => {
        response = res;
        //  handle responses that don't have a payload
        if (res.headers.get('Content-Type') || ''.indexOf('json') > 0) {
          return res.json();
        } else {
          resolve(response);
        }
      })
      .then((body) => {
        //  resolve the promise with the parsed body if a successful request
        if (response.ok) {
          response.parsedBody = body;
          resolve(response);
        }
        //  reject the promise if the request is unsuccessful
        else {
          reject(response);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};
