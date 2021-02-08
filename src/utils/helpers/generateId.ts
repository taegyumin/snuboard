import { customAlphabet } from 'nanoid';

// Exclude dash or underscore for simplicity
export const generateId = (size: number): string =>
  customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', size)();
