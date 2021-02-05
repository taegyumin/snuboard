import { UserPermission, UserData } from '../types/author';

const virtualUsers: { [username: string]: UserData } = {
  root: {
    username: 'root',
    permission: UserPermission.admin,
    groups: [],
  },
};

const virtualTable: { [secretKey: string]: UserData } = {
  taegyumin: virtualUsers.root,
};

export const authorize = (secretKey: string): UserData | null =>
  virtualTable[secretKey];

export const getAllUsers = (): UserData[] => Object.values(virtualUsers);
