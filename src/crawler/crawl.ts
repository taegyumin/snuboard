import { APIGatewayProxyHandler } from 'aws-lambda';
import middleware from './middleware';

export const handler: APIGatewayProxyHandler = middleware(async () => {
  try {
    console.log('done');
  } catch (e) {
    console.log(e);
  }
  return {
    statusCode: 200,
    body: 'ok',
  };
});
