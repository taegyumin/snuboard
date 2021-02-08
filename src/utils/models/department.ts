import { DepartmentData } from '../types/department';
import {
  generateScanQuery,
  scanAll,
  countAll,
  putWithErrorHandling,
} from '../helpers/query';
import { appConfig } from '../constants';
import dynamodb, { AttributeMap } from '../helpers/dynamodb';

function assertDepartmentData(
  data: AttributeMap
): asserts data is DepartmentData {
  const attributes: (keyof DepartmentData)[] = ['id', 'url', 'name'];
  const isContainingAttributes = attributes.every((attr) => attr in data);
  if (isContainingAttributes) {
    return;
  }
  throw new Error('Invalid departmentData');
}

const TABLE_NAME = appConfig.tables.department;

class Department {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly data: DepartmentData) {}

  get id(): string {
    return this.data.id;
  }

  get url(): string {
    return this.data.url;
  }

  get name(): string {
    return this.data.name;
  }

  getData(): DepartmentData {
    return this.data;
  }

  static async create(data: DepartmentData): Promise<DepartmentData> {
    const { id } = data;
    const params = {
      Key: { id },
      Item: data,
      TableName: TABLE_NAME,
      ConditionExpression: 'attribute_not_exists(id)',
    };

    await putWithErrorHandling(params);

    return new Department(data);
  }

  static async get(id: string): Promise<Department | null> {
    const res = await dynamodb
      .get({
        Key: { id },
        TableName: TABLE_NAME,
      })
      .promise();
    const data = res.Item;
    if (!data) return null;
    assertDepartmentData(data);
    return new Department(data);
  }

  static async find(where: Partial<DepartmentData>): Promise<Department[]> {
    const query = generateScanQuery(where);
    const params = {
      ...query,
      TableName: TABLE_NAME,
      Select: 'ALL_ATTRIBUTES',
    };
    const items = await scanAll(params);
    return items.map((item) => {
      assertDepartmentData(item);
      return new Department(item);
    });
  }

  static async getAll(): Promise<Department[]> {
    const params = {
      TableName: TABLE_NAME,
      Select: 'ALL_ATTRIBUTES',
    };
    const items = await scanAll(params);
    return items.map((item) => {
      assertDepartmentData(item);
      return new Department(item);
    });
  }

  static async count(where?: Partial<DepartmentData>): Promise<number> {
    const query = where ? generateScanQuery(where) : {};
    const params = {
      ...query,
      TableName: TABLE_NAME,
    };
    return countAll(params);
  }

  async destroy(): Promise<void> {
    console.log(`Destroy department ${this.id} `);
    await dynamodb
      .delete({ Key: { id: this.id }, TableName: TABLE_NAME })
      .promise();
  }
}

export default Department;
