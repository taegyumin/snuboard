import { max } from 'lodash';
import { BoardData } from '../types/board';
import {
  generateScanQuery,
  scanAll,
  countAll,
  putWithErrorHandling,
} from '../helpers/query';
import Department from './department';
import Notice from './notice';
import { appConfig } from '../constants/index';
import dynamodb, { AttributeMap } from '../helpers/dynamodb';

const { serviceLaunchedAt } = appConfig;

function assertBoardData(data: AttributeMap): asserts data is BoardData {
  const attributes: (keyof BoardData)[] = [
    'id',
    'departmentId',
    'name',
    'urlPath',
  ];
  const isContainingAttributes = attributes.every((attr) => attr in data);
  if (isContainingAttributes) {
    return;
  }
  throw new Error('Invalid boardData');
}

const TABLE_NAME = appConfig.tables.board;

class Board {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly data: BoardData) {}

  get id(): string {
    return this.data.id;
  }

  get departmentId(): string {
    return this.data.departmentId;
  }

  get name(): string {
    return this.data.name;
  }

  get urlPath(): string {
    return this.data.urlPath;
  }

  getData(): BoardData {
    return this.data;
  }

  async getBaseDate(): Promise<string> {
    const notices = await Notice.find({ boardId: this.data.id });
    if (notices.length === 0) return serviceLaunchedAt;
    const dates = notices.map((notice) => notice.createdAt);
    return max(dates) || serviceLaunchedAt;
  }

  static async create(data: BoardData): Promise<BoardData> {
    const { id } = data;
    const params = {
      Key: { id },
      Item: data,
      TableName: TABLE_NAME,
      ConditionExpression: 'attribute_not_exists(id)',
    };

    await putWithErrorHandling(params);

    return new Board(data);
  }

  static async get(id: string): Promise<Board | null> {
    const res = await dynamodb
      .get({
        Key: { id },
        TableName: TABLE_NAME,
      })
      .promise();
    const data = res.Item;
    if (!data) return null;
    assertBoardData(data);
    return new Board(data);
  }

  async getDepartment(): Promise<Department> {
    const department = await Department.get(this.departmentId);
    if (!department)
      throw new Error(
        `Department not found(id=${this.departmentId}) for board(id=${this.id}`
      );
    return department;
  }

  static async find(where: Partial<BoardData>): Promise<Board[]> {
    const query = generateScanQuery(where);
    const params = {
      ...query,
      TableName: TABLE_NAME,
      Select: 'ALL_ATTRIBUTES',
    };
    const items = await scanAll(params);
    return items.map((item) => {
      assertBoardData(item);
      return new Board(item);
    });
  }

  static async getAll(): Promise<Board[]> {
    const params = {
      TableName: TABLE_NAME,
      Select: 'ALL_ATTRIBUTES',
    };
    const items = await scanAll(params);
    return items.map((item) => {
      assertBoardData(item);
      return new Board(item);
    });
  }

  static async count(where?: Partial<BoardData>): Promise<number> {
    const query = where ? generateScanQuery(where) : {};
    const params = {
      ...query,
      TableName: TABLE_NAME,
    };
    return countAll(params);
  }

  async destroy(): Promise<void> {
    console.log(`Destroy board ${this.id} `);
    await dynamodb
      .delete({ Key: { id: this.id }, TableName: TABLE_NAME })
      .promise();
  }
}

export default Board;
