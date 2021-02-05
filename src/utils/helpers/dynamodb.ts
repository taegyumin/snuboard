import { DynamoDB } from 'aws-sdk';
import { appConfig } from '../constants/index';

const options =
  appConfig.stage === 'dev'
    ? {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        accessKeyId: 'FAKE_ACCESS_KEY',
        secretAccessKey: 'FAKE_SECRET',
        convertEmptyValues: true,
      }
    : {
        convertEmptyValues: true,
        httpOptions: {
          timeout: 5000,
          maxRetries: 3,
        },
      };

const dynamodb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  ...options,
});

export default dynamodb;
export type AttributeMap = DynamoDB.DocumentClient.AttributeMap;
