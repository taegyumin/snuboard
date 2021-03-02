export type Filter = { boards: number[]; departments: number[] };

export interface UserData {
  kakaoId: string;
  name?: string;
  filter?: Filter;
  // schedule?: any;
}
