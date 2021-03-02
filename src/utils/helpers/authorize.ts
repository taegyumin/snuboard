import { UserPermission, UserData } from '../types/author';

const virtualUsers: { [username: string]: UserData } = {
  root: {
    username: 'root',
    permission: UserPermission.admin,
    groups: [],
  },
};

const virtualTable: { [secretKey: string]: UserData } = {
  boardsnu: virtualUsers.root,
};

export const authorize = (secretKey: string): UserData | null =>
  virtualTable[secretKey];

export const getAllUsers = (): UserData[] => Object.values(virtualUsers);

// virtualTable을 숨기기 (보안상)
// type/author 이거 파일 이름이랑 안에 정의되어 있는 것들 고치자... user vs author
// middleware나 그 밖에 event parsing할 수 있는 거 만들자.
