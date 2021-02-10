import axios from 'axios';
import * as cheerio from 'cheerio';
import { chain } from 'lodash';
import Board from '../utils/models/board';
import Notice from '../utils/models/notice';
import { NoticeData } from '../utils/types/notice';
import Department from '../utils/models/department';
import { generateId } from '../utils/helpers/generateId';

export const instance = axios.create();

const crawlIE = async (): Promise<void> => {
  const NOTICE_SELECTOR =
    '#block-system-main > div > div > div.view-content > table > tbody > tr';
  const CREATEDAT_SELECTOR = 'td.views-field.views-field-created';
  const TITLE_SELECTOR = 'td.views-field.views-field-title-field > a';
  const URLPATH_SELECTOR = 'td.views-field.views-field-title-field > a';
  const CONTENT_SELECTOR = 'div.field-items > .field-item';

  const departmentId = '0';
  const department = await Department.get(departmentId);
  if (!department) throw new Error(`Department ${departmentId} not exist`);
  const { urlPath: departmentUrlPath } = department;

  const boards = await Board.find({ departmentId });
  if (boards.length === 0)
    throw new Error(`Board not exist in department [${departmentId}]`);

  console.log(`crawlerBoard start with departmentId [${departmentId}]`);

  const crawlerBoard = async (board: Board) => {
    const { urlPath: boardUrlPath, id: boardId } = board;
    const baseDate = await board.getBaseDate();

    const crawlerPage = async (pageNumber = 0) => {
      console.log(`crawlerPage start with boardId [${boardId}]`);
      const noticeHeaders: {
        urlPath: string;
        title: string;
        createdAt: string;
      }[] = [];
      const response = await instance.get(`${boardUrlPath}?page=${pageNumber}`);
      const html = response.data;
      const $ = cheerio.load(html);
      const $notices = $(NOTICE_SELECTOR);
      await $notices.map(async (_, value) => {
        const createdAt = $(value).find(CREATEDAT_SELECTOR).text().trim();
        const title = $(value).find(TITLE_SELECTOR).text().trim();
        const urlPath = $(value).find(URLPATH_SELECTOR).attr('href')?.trim();
        noticeHeaders.push({
          urlPath: departmentUrlPath + urlPath,
          title,
          createdAt,
        });
      });

      const noticeData: NoticeData[] = await Promise.all(
        noticeHeaders.map(async (noticeHeader) => {
          const id = await generateId(10);
          const { urlPath, createdAt, title } = noticeHeader;
          if (createdAt < baseDate) return;
          const response = await instance.get(urlPath);
          const html = response.data;
          const $ = cheerio.load(html);
          const content = $(CONTENT_SELECTOR).text(); // get full content
          const noticeData = {
            id,
            title,
            createdAt,
            content,
            urlPath,
            boardId,
          };
          await Notice.create(noticeData);
          // eslint-disable-next-line consistent-return
          return noticeData;
        })
      ).then((data) => chain(data).compact().value());

      if (noticeHeaders.length !== noticeData.length) return;
      await crawlerPage(++pageNumber);
    };

    await crawlerPage();
  };

  await Promise.all(
    boards.map(async (board) => {
      await crawlerBoard(board);
    })
  );
};

const crawlENG = async (): Promise<void> => {
  const NOTICE_SELECTOR =
    '#block-system-main > div > div > div.view-content.hg > table > tbody > tr';
  const CREATEDAT_SELECTOR =
    'td.views-field.views-field-created.views-align-center';
  const TITLE_SELECTOR =
    'td.views-field.views-field-title.views-align-center.alignLeft > a';
  const URLPATH_SELECTOR =
    'td.views-field.views-field-title.views-align-center.alignLeft > a';
  const CONTENT_SELECTOR =
    '#block-system-main > div > article > div > div > div > div';

  const departmentId = '1';
  const department = await Department.get(departmentId);
  if (!department) throw new Error(`Department ${departmentId} not exist`);
  const { urlPath: departmentUrlPath } = department;

  const boards = await Board.find({ departmentId });
  if (boards.length === 0)
    throw new Error(`Board not exist in department [${departmentId}]`);

  console.log(`crawlerBoard start with departmentId [${departmentId}]`);

  const crawlerBoard = async (board: Board) => {
    const { urlPath: boardUrlPath, id: boardId } = board;
    const baseDate = await board.getBaseDate();

    const crawlerPage = async (pageNumber = 0) => {
      console.log(`crawlerPage start with boardId [${boardId}]`);
      const noticeHeaders: {
        urlPath: string;
        title: string;
        createdAt: string;
      }[] = [];
      const response = await instance.get(`${boardUrlPath}?page=${pageNumber}`);
      const html = response.data;
      const $ = cheerio.load(html);
      const $notices = $(NOTICE_SELECTOR);
      await $notices.map(async (_, value) => {
        const isDSK = $(value).attr('class')?.trim();
        if (isDSK) return;
        const createdAt = $(value).find(CREATEDAT_SELECTOR).text().trim();
        const title = $(value).find(TITLE_SELECTOR).text().trim();
        const urlPath = $(value).find(URLPATH_SELECTOR).attr('href')?.trim();
        noticeHeaders.push({
          urlPath: departmentUrlPath + urlPath,
          title,
          createdAt,
        });
      });

      const noticeData: NoticeData[] = await Promise.all(
        noticeHeaders.map(async (noticeHeader) => {
          const id = await generateId(10);
          const { urlPath, createdAt, title } = noticeHeader;
          if (createdAt < baseDate) return;
          const response = await instance.get(urlPath);
          const html = response.data;
          const $ = cheerio.load(html);
          const content = $(CONTENT_SELECTOR).text(); // get full content
          const noticeData = {
            id,
            title,
            createdAt,
            content,
            urlPath,
            boardId,
          };
          await Notice.create(noticeData);
          // eslint-disable-next-line consistent-return
          return noticeData;
        })
      ).then((data) => chain(data).compact().value());

      if (noticeHeaders.length !== noticeData.length) return;
      await crawlerPage(++pageNumber);
    };

    await crawlerPage();
  };

  await Promise.all(
    boards.map(async (board) => {
      await crawlerBoard(board);
    })
  );
};

export const crawl = async (): Promise<void> => {
  await Promise.all([crawlIE(), crawlENG()]);
};
