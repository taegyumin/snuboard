import { APIGatewayProxyHandler } from 'aws-lambda';
import middleware from './middleware';
import { crawl } from './index';

export const handler: APIGatewayProxyHandler = middleware(async () => {
  console.log('start crawl');
  await crawl();
  console.log('end crawl');
  return {
    statusCode: 200,
    body: 'ok',
  };
});
