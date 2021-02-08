import type { DynamoDB } from 'aws-sdk';
import { map, pickBy } from 'lodash';
import dynamodb, { AttributeMap } from './dynamodb';

// 26진법으로 number 표현
export const getKeyForIndex = (index: number): string => {
  const share = Math.floor(index / 26);
  const remainder = index % 26;
  const char = String.fromCharCode(97 + remainder);
  if (share === 0) return char;
  return `${getKeyForIndex(share - 1)}${char}`;
};

const generateExpressionAttribute = (
  map: AttributeMap
): {
  ExpressionAttributeNames: DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  ExpressionAttributeValues: DynamoDB.DocumentClient.ExpressionAttributeValueMap;
  variables: { [name: string]: string };
} => {
  const entries = Object.entries(map);
  if (entries.length === 0) throw new Error('At least one entry should exist');

  const names: DynamoDB.DocumentClient.ExpressionAttributeNameMap = {};
  const values: DynamoDB.DocumentClient.ExpressionAttributeValueMap = {};
  const variables: { [name: string]: string } = {};

  entries.forEach(([name, value], i) => {
    const key = getKeyForIndex(i);
    const nameVar = `#${key}`;
    names[nameVar] = name;
    const valueVar = `:${key}`;
    values[valueVar] = value;
    variables[nameVar] = valueVar;
  });

  return {
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    variables,
  };
};

export const generateScanQuery = (
  equal: AttributeMap
): {
  ExpressionAttributeNames: DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  ExpressionAttributeValues: DynamoDB.DocumentClient.ExpressionAttributeValueMap;
  FilterExpression: string;
} => {
  const {
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    variables,
  } = generateExpressionAttribute(equal);
  return {
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    FilterExpression: map(variables, (val, name) => {
      return `${name} = ${val}`;
    }).join(' AND '),
  };
};

export const generateQueryQuery = (
  equal: AttributeMap
): {
  ExpressionAttributeNames: DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  ExpressionAttributeValues: DynamoDB.DocumentClient.ExpressionAttributeValueMap;
  KeyConditionExpression: string;
} => {
  const {
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    variables,
  } = generateExpressionAttribute(equal);
  return {
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    KeyConditionExpression: map(variables, (val, name) => {
      return `${name} = ${val}`;
    }).join(' AND '),
  };
};

export const generateUpdateQuery = (
  setMap: AttributeMap
): {
  ExpressionAttributeNames: DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  ExpressionAttributeValues: DynamoDB.DocumentClient.ExpressionAttributeValueMap;
  UpdateExpression: string;
} => {
  const {
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    variables,
  } = generateExpressionAttribute(setMap);
  return {
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    UpdateExpression: `SET ${map(
      variables,
      (val, name) => `${name} = ${val}`
    ).join(', ')}`,
  };
};

export const queryAll = async (
  params: DynamoDB.DocumentClient.QueryInput,
  prevLastKey?: DynamoDB.DocumentClient.Key
): Promise<AttributeMap[]> => {
  const actualParams = prevLastKey
    ? {
        ...params,
        ExclusiveStartKey: prevLastKey,
      }
    : params;
  const {
    Items: items = [],
    LastEvaluatedKey: lastEvaluatedKey,
  } = await dynamodb.query(actualParams).promise();
  if (!lastEvaluatedKey) return items;
  const nextItems = await queryAll(params, lastEvaluatedKey);
  return [...items, ...nextItems];
};

export const scanAll = async (
  params: DynamoDB.DocumentClient.ScanInput,
  prevLastKey?: DynamoDB.DocumentClient.Key
): Promise<AttributeMap[]> => {
  const actualParams = prevLastKey
    ? {
        ...params,
        ExclusiveStartKey: prevLastKey,
      }
    : params;
  const {
    Items: items = [],
    LastEvaluatedKey: lastEvaluatedKey,
  } = await dynamodb.scan(actualParams).promise();
  if (!lastEvaluatedKey) return items;
  const nextItems = await scanAll(params, lastEvaluatedKey);
  return [...items, ...nextItems];
};

export const countAll = async (
  params: DynamoDB.DocumentClient.ScanInput,
  prevLastKey?: DynamoDB.DocumentClient.Key
): Promise<number> => {
  const actualParams = prevLastKey
    ? {
        ...params,
        ExclusiveStartKey: prevLastKey,
        Select: 'COUNT',
      }
    : params;
  const { Count = 0, LastEvaluatedKey: lastEvaluatedKey } = await dynamodb
    .scan(actualParams)
    .promise();
  if (!lastEvaluatedKey) return Count;
  return Count + (await countAll(params, lastEvaluatedKey));
};

export const putWithErrorHandling = async (params: {
  Key: DynamoDB.DocumentClient.Key;
  Item: AttributeMap;
  TableName: string;
  ConditionExpression: string;
}): Promise<void> => {
  const { Key, Item, TableName, ConditionExpression } = params;
  try {
    await dynamodb
      .put({
        Item: { ...Item },
        TableName,
        ConditionExpression,
      })
      .promise();
  } catch (e) {
    const tags = pickBy(Item, (v) =>
      ['string', 'number', 'boolean'].includes(typeof v)
    );
    e.tag = { ...tags, originalErrorName: e.name };
    e.name = `${TableName} Error`;
    throw e;
  }
};
