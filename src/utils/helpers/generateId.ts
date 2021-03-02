import { customAlphabet } from 'nanoid';
import { Md5 } from 'ts-md5/dist/md5';

// Exclude dash or underscore for simplicity
export const generateId = (size: number): string =>
  customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', size)();

// TODO: Shorten hash to shorter than 10.
export const generateHash = (value: string): string => {
  const hash = Md5.hashStr(value);
  if (typeof hash === 'string') return hash;
  throw new Error('type of hash is not string');
};
