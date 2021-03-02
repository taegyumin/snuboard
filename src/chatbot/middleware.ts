import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import * as util from 'util';
import { UserData } from '../utils/types/author';
import { authorize } from '../utils/helpers/authorize';
import { appConfig } from '../utils/constants';
import { getPathName } from '../utils/constants/paths';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const EventEmitter = require('events');

EventEmitter.defaultMaxListeners = 0;

export type Handler = (
  event: APIGatewayProxyEvent,
  user: UserData | null
) => Promise<{
  statusCode: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}>;

type RawResponse = {
  statusCode: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
};

type Response = {
  statusCode: number;
  headers: {
    'Access-Control-Allow-Origin': '*';
  };
  body: string;
};

const BASE_PATH = `/${appConfig.stage}`;

const middleware = (handler: Handler): APIGatewayProxyHandler => {
  return async (event, context): Promise<Response> => {
    // Clip out basePath for easier match
    event.path = event.path.startsWith(BASE_PATH)
      ? event.path.substring(BASE_PATH.length)
      : event.path;

    console.log(
      '\x1b[32m%s\x1b[0m',
      `--- http-${event.httpMethod}-${event.path}-start ---`
    );
    if (event.path && event.path.startsWith('/users')) {
      // Prevent password from being logged
    } else {
      const body = event.body ? JSON.parse(event.body) : {};
      console.log(util.inspect(body, { showHidden: false, depth: null }));
    }
    const getResponse = async (): Promise<RawResponse> => {
      const secret = event.headers.Authorization || event.headers.authorization;
      const user = secret && authorize(secret);
      if (secret && !user) {
        return {
          statusCode: 401,
          body: { message: 'Invalid secretKey' },
        };
      }
      return handler(event, user || null);
    };

    const getResponseWithErrorHandler = async (): Promise<RawResponse> => {
      const taskWithTimeout = (): Promise<RawResponse> =>
        new Promise((resolve, reject) => {
          const remainingTimeBeforeStartMainTask = context.getRemainingTimeInMillis();
          const timeout = setTimeout(() => {
            reject(new Error('Task timed out'));
          }, remainingTimeBeforeStartMainTask - 2000);
          getResponse()
            .then((result) => {
              clearTimeout(timeout);
              resolve(result);
            })
            .catch((e) => {
              clearTimeout(timeout);
              reject(e);
            });
        });
      try {
        const result = await taskWithTimeout();
        return result;
      } catch (error) {
        const method = event.httpMethod;
        const pathName = getPathName(event.path);
        error.name = `${method} ${pathName} ${error.name}`;
        return {
          statusCode: error.statusCode ?? 500,
          body: { message: error.message },
        };
      }
    };

    const response = await getResponseWithErrorHandler();
    console.log(util.inspect(response, { showHidden: false, depth: null }));
    console.log(`\x1b[36m%s\x1b[0m`, `--- http-${event.path}-end ---`);

    return {
      statusCode: response.statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response.body),
    };
  };
};

export default middleware;
