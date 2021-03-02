import { Path } from 'path-parser';
import { findKey } from 'lodash';

// 사용자 정보 등록(post), 조회(get), 수정(put), 삭제(delete)
// 원래는 new Path('/users/:userId/get')와 같이 짜는 게 맞는데...
// post만 가능하고 path가 고정적인 카카오톡 챗봇의 한계를 고려함.
export const userPaths = {
  departmentsGetPath: new Path('/departments/get'), // deparments 전부를 가져오기
  boardsGetPath: new Path('/boards/get'), // boards 전부를 가져오기
  noticesGetPath: new Path('/notices/get'), // notices 전부를 가져오기
  userGetPath: new Path('/user/get'), // 특정 사용자의 정보 조회
  userPutPath: new Path('/user/put'), // 특정 사용자의 정보 수정
  userDeletePath: new Path('/user/delete'), // 특정 사용자의 정보 삭제
  userNoticesGetPath: new Path('/user/notices/get'), // 특정 사용자의 모든 공지사항 조회
  userDepartmentPostPath: new Path('user/department/post'), // 특정 사용자의 즐겨찾기 중 특정 학과 추가
  userDepartmentDeletePath: new Path('user/department/Delete'), // 특정 사용자의 즐겨찾기 중 특정 학과 삭제
  userBoardPostPath: new Path('/user/board/post'), // 특정 사용자의 즐겨찾기 중 특정 보드 추가
  userBoardDeletePath: new Path('/user/board/delete'), // 특정 사용자의 즐겨찾기 중 특정 보드 삭제
  userKeywordPostPath: new Path('/user/keyword/post'), // 특정 사용자의 즐겨찾기 중 특정 키워드 추가
  userKeywordDeletePath: new Path('/user/keyword/delete'), // 특정 사용자의 즐겨찾기 중 특정 키워드 삭제
};

export const userKeywordsPaths = {
  userKeywordsGetPath: new Path('/user/keywords/get'), // 특정 사용자의 모든 키워드 조회
  userKeywordsDeletePath: new Path('/user/keywords/delete'), // 특정 사용자의 모든 키워드 삭제
};

const allPaths = {
  ...userPaths,
  ...userKeywordsPaths,
};

export const getPathName = (givenPath: string): string => {
  const pathName = findKey(allPaths, (path) => path.test(givenPath));
  return pathName || 'Unknown';
};

// event API를 못 쓰니까 일단 스케쥴링은 하지 말자.
// 앞으로 해야 할 일은
// 1. 사용자 정보 등록(post), 조회(get), 수정(put), 삭제(delete)
// 2. (학과, 보드, 키워드) 즐겨찾기 등록, 검색, 수정, 삭제
// 3. (학과, 보드) 정보 검색
// 4. 공지사항 조회 (날짜 또는 기간은 필수, 맞춤 검색 기능)
// 5. 리포트 채널: 학과 및 게시판 생성 건의, 이외에 아무거나 건의할 공간 만들기
