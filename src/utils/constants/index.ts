import { tables } from './table-names';

const { STAGE } = process.env as { STAGE: string };

export const appConfig = { tables, stage: STAGE };
