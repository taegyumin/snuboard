import { NoticeData } from '../types/notice';
import { appConfig } from '../constants';
import dynamodb, { AttributeMap } from '../helpers/dynamodb';
import {
  generateScanQuery,
  scanAll,
  countAll,
  putWithErrorHandling,
} from '../helpers/query';

function assertNoticeData(data: AttributeMap): asserts data is NoticeData {
  const attributes: (keyof NoticeData)[] = [
    'id',
    'createdAt',
    'title',
    'boardId',
    'url',
  ];
  const isContainingAttributes = attributes.every((attr) => attr in data);
  if (isContainingAttributes) {
    return;
  }
  throw new Error('Invalid noticeData');
}

const TABLE_NAME = appConfig.tables.notice;

class Notice {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly data: NoticeData) {}

  get id(): string {
    return this.data.id;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get title(): string {
    return this.data.title;
  }

  get boardId(): string {
    return this.data.boardId;
  }

  get content(): string | undefined {
    // content can be empty.
    return this.data.content;
  }

  get url(): string {
    return this.data.url;
  }

  getData(): NoticeData {
    return this.data;
  }

  static async create(data: NoticeData): Promise<NoticeData> {
    const { createdAt, title } = data;
    const params = {
      Key: { createdAt, title },
      Item: data,
      TableName: TABLE_NAME,
    };

    await putWithErrorHandling(params);

    return new Notice(data);
  }

  static async get(id: string): Promise<Notice | null> {
    const res = await dynamodb
      .get({
        Key: { id },
        TableName: TABLE_NAME,
      })
      .promise();
    const data = res.Item;
    if (!data) return null;
    assertNoticeData(data);
    return new Notice(data);
  }

  static async find(where: Partial<NoticeData>): Promise<Notice[]> {
    const query = generateScanQuery(where);
    const params = {
      ...query,
      TableName: TABLE_NAME,
      Select: 'ALL_ATTRIBUTES',
    };
    const items = await scanAll(params);
    return items.map((item) => {
      assertNoticeData(item);
      return new Notice(item);
    });
  }

  static async getAll(): Promise<Notice[]> {
    const params = {
      TableName: TABLE_NAME,
      Select: 'ALL_ATTRIBUTES',
    };
    const items = await scanAll(params);
    return items.map((item) => {
      assertNoticeData(item);
      return new Notice(item);
    });
  }

  static async count(where?: Partial<NoticeData>): Promise<number> {
    const query = where ? generateScanQuery(where) : {};
    const params = {
      ...query,
      TableName: TABLE_NAME,
    };
    return countAll(params);
  }

  async destroy(): Promise<void> {
    console.log(`Destroy notice ${this.id} `);
    await dynamodb
      .delete({ Key: { id: this.id }, TableName: TABLE_NAME })
      .promise();
  }
}

export default Notice;
