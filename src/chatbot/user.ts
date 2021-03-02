import { chain } from 'lodash';
import { APIGatewayProxyHandler } from 'aws-lambda';
import middleware from './middleware';
// import { userPaths } from '../utils/constants/paths';
import { appConfig } from '../utils/constants/index';
import User from '../utils/models/user';
import Board from '../utils/models/board';
import Notice from '../utils/models/notice';
import Department from '../utils/models/department';

/* Paths */
// const { mediaRecorderPath } = userPaths;

type KakaoResponse = {
  contents: any[];
  headers: {
    'Access-Control-Allow-Origin': '*';
  };
};

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = event.body ? JSON.parse(event.body) : {};

  if (event.headers.secretkeys !== appConfig.secretKeys) {
    return {
      statusCode: 403,
      body: {
        message: 'Invalid secretkeys',
      },
    };
  }

  if (!body) {
    return {
      statusCode: 404,
      body: { message: `Missing body` },
    };
  }

  const { id: botId } = body.bot;
  const { id: userId } = body.userRequest.user;
  if (!botId || !userId) {
    return {
      statusCode: 404,
      body: { message: `Invalid data` },
    };
  }
  if (body.bot.id !== '601d4cc6329dd429ced03ff7') {
    return {
      statusCode: 403,
      body: { message: `Invalid bot ID` },
    };
  }

  const user = await User.get(userId);
  if (!user) await User.create({ kakaoId: userId });

  const { params } = body.action;

  const { departmentId } = params;
  if (!departmentId)
    return {
      statusCode: 404,
      body: { message: `Missing departmentId` },
    };

  const department = await Department.get(departmentId);
  if (!department)
    return {
      statusCode: 404,
      body: { message: `Invalid departmentId` },
    };

  const boards = await Board.find({ departmentId: department.id });
  const noticesByBoards = await Promise.all(
    boards.map(async (board) => {
      const notices = await Notice.find({ boardId: board.id });
      return notices;
    })
  );
  const notices = chain(noticesByBoards).flatten().compact().value();

  return {
    version: '2.0',
    template: {
      outputs: [
        {
          listCard: {
            header: {
              title: '카카오 i 디벨로퍼스를 소개합니다',
            },
            items: [
              {
                title: 'Kakao i Developers',
                description: '새로운 AI의 내일과 일상의 변화',
                imageUrl:
                  'http://k.kakaocdn.net/dn/APR96/btqqH7zLanY/kD5mIPX7TdD2NAxgP29cC0/1x1.jpg',
                link: {
                  web:
                    'https://namu.wiki/w/%EB%9D%BC%EC%9D%B4%EC%96%B8(%EC%B9%B4%EC%B9%B4%EC%98%A4%ED%94%84%EB%A0%8C%EC%A6%88)',
                },
              },
              {
                title: 'Kakao i Open Builder',
                description: '카카오톡 채널 챗봇 만들기',
                imageUrl:
                  'http://k.kakaocdn.net/dn/N4Epz/btqqHCfF5II/a3kMRckYml1NLPEo7nqTmK/1x1.jpg',
                link: {
                  web:
                    'https://namu.wiki/w/%EB%AC%B4%EC%A7%80(%EC%B9%B4%EC%B9%B4%EC%98%A4%ED%94%84%EB%A0%8C%EC%A6%88)',
                },
              },
              {
                title: 'Kakao i Voice Service',
                description: '보이스봇 / KVS 제휴 신청하기',
                imageUrl:
                  'http://k.kakaocdn.net/dn/bE8AKO/btqqFHI6vDQ/mWZGNbLIOlTv3oVF1gzXKK/1x1.jpg',
                link: {
                  web: 'https://namu.wiki/w/%EC%96%B4%ED%94%BC%EC%B9%98',
                },
              },
            ],
            buttons: [
              {
                label: '구경가기',
                action: 'webLink',
                webLinkUrl:
                  'https://namu.wiki/w/%EC%B9%B4%EC%B9%B4%EC%98%A4%ED%94%84%EB%A0%8C%EC%A6%88',
              },
            ],
          },
        },
      ],
    },
  };

  //   return {
  //     statusCode: 404,
  //     body: { message: `Invalid request path: ${event.path}` },
  //   };
};
