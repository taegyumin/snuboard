import { tables } from './table-names';

const { STAGE } = process.env as { STAGE: string };
const isDevEnv = STAGE === 'dev';
const { DEV_HTTP_PORT, DEV_LAMBDA_PORT } = process.env;

export const appConfig = {
  tables,
  secretKeys: 'snuboard-tyler',
  stage: STAGE,
  isDevEnv,
  httpEndpoint:
    isDevEnv || !process.env.HTTP_ENDPOINT
      ? `http://localhost:${DEV_HTTP_PORT}/dev`
      : process.env.HTTP_ENDPOINT,
  devLambdaEndpoint: `http://localhost:${DEV_LAMBDA_PORT}`,
  serviceLaunchedAt: '2021-01-01',
};
