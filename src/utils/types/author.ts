export declare enum UserPermission {
  viewer = 0,
  client = 1,
  manager = 2,
  admin = 3,
}
export interface UserData {
  username: string;
  permission: UserPermission;
  groups: string[];
}
