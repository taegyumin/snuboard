import { UserData, Filter } from '../types/user';
import { appConfig } from '../constants';
import dynamodb, { AttributeMap } from '../helpers/dynamodb';
import {
  generateScanQuery,
  scanAll,
  countAll,
  putWithErrorHandling,
} from '../helpers/query';

function assertNoticeData(data: AttributeMap): asserts data is UserData {
  const attributes: (keyof UserData)[] = ['kakaoId'];
  const isContainingAttributes = attributes.every((attr) => attr in data);
  if (isContainingAttributes) {
    return;
  }
  throw new Error('Invalid userData');
}

const TABLE_NAME = appConfig.tables.notice;

class User {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly data: UserData) {}

  get kakaoId(): string {
    return this.data.kakaoId;
  }

  get createdAt(): string | undefined {
    return this.data.name;
  }

  get filter(): Filter | undefined {
    return this.data.filter;
  }

  getData(): UserData {
    return this.data;
  }

  static async create(data: UserData): Promise<UserData> {
    const { kakaoId } = data;
    const params = {
      Key: { kakaoId },
      Item: data,
      TableName: TABLE_NAME,
      ConditionExpression: 'attribute_not_exists(kakaoId)',
    };
    await putWithErrorHandling(params);
    return new User(data);
  }

  static async get(kakaoId: string): Promise<User | null> {
    const res = await dynamodb
      .get({
        Key: { kakaoId },
        TableName: TABLE_NAME,
      })
      .promise();
    const data = res.Item;
    if (!data) return null;
    assertNoticeData(data);
    return new User(data);
  }

  static async find(where: Partial<UserData>): Promise<User[]> {
    const query = generateScanQuery(where);
    const params = {
      ...query,
      TableName: TABLE_NAME,
      Select: 'ALL_ATTRIBUTES',
    };
    const items = await scanAll(params);
    return items.map((item) => {
      assertNoticeData(item);
      return new User(item);
    });
  }

  static async getAll(): Promise<User[]> {
    const params = {
      TableName: TABLE_NAME,
      Select: 'ALL_ATTRIBUTES',
    };
    const items = await scanAll(params);
    return items.map((item) => {
      assertNoticeData(item);
      return new User(item);
    });
  }

  static async count(where?: Partial<UserData>): Promise<number> {
    const query = where ? generateScanQuery(where) : {};
    const params = {
      ...query,
      TableName: TABLE_NAME,
    };
    return countAll(params);
  }

  async destroy(): Promise<void> {
    console.log(`Destroy user ${this.kakaoId} `);
    await dynamodb
      .delete({ Key: { kakaoId: this.kakaoId }, TableName: TABLE_NAME })
      .promise();
  }
}

export default User;
