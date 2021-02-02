from bs4 import BeautifulSoup
from dynamoDB import scan
from boto3.dynamodb.conditions import Attr
import requests
from crawler.types import *


def crawl(board_id):
    params = Params(board_id=board_id)

    soup = enter_board(params)

def enter_board(params):
    table_name = 'boards'
    filter_expression = Attr('id').eq(str(params.board_id))
    board = scan(filter_expression=filter_expression, table_name=table_name)[0]

    params.department_id = board['department_id']

    table_name = 'departments'
    filter_expression = Attr('id').eq(str(params.department_id))
    department = scan(filter_expression=filter_expression, table_name=table_name)[0]

    params.base_href = department['base_href']
    params.uri = board['uri']

    req = requests.get(params.base_href + params.uri)
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')

    return soup

def get_notices_links(soup: BeautifulSoup, params: Params):
    params.base_date = get_base_date(board_id=params.board_id)

    notices = parse_notices(params)

    return notices


def parse_notices(params: Params):
    department_id = params.department_id
    result = []

    if str(department_id) == '0':
        result += parse_notices_ie(params)
    elif str(department_id) == '1':
        result += parse_notices_eng(params)

    return result

def parse_notices_ie(params: Params):
    soup = params.soup
    base_date = params.base_date
    base_href = params.base_href
    board_id = params.board_id

    result = []

    notices = soup.select(
        '#block-system-main > div > div > div.view-content > table > tbody > tr > td.views-field.views-field-title-field > a'
    )
    dates = soup.select(
        '#block-system-main > div > div > div.view-content > table > tbody > tr > td.views-field.views-field-created'
    )
    for pair in zip(notices, dates):
        notice = pair[0]
        date = pair[1].text.strip()

        if base_date <= date:
            href = base_href + notice.get('href')
            req = requests.get(href)
            html = req.text
            soup = BeautifulSoup(html, 'html.parser')

            params = params_parse_notice(soup=soup, href=href, board_id=board_id)
            result.append(parse_notice_ie(params))
        else:
            break

    return result

def parse_notice_ie(params: params_parse_notice):
    soup = params.soup
    href = params.href
    board_id = params.board_id

    # 1. get the title of each notice
    title = soup.find('div', class_='field-name-title').find('h2').text.strip()

    # 2. get the created date of each notice
    created = soup.find('div', class_='field-name-post-date').find('div', class_='even').text[0:10]

    # 3. get the content of each notice
    content = soup.find('div', class_='field-name-body').text.strip()

    # print(title, created)

    # 4. return object of notice
    return Notice(title=title,
                  created=created,
                  content=content,
                  href=href,
                  board_id=board_id)

def parse_notices_eng(params: Params):
    soup = params.soup
    base_date = params.base_date
    base_href = params.base_href
    board_id = params.board_id

    result = []

    date_index = 0
    dates = soup.find_all('td', class_='views-field-created')
    start_index = len(dates) - 10  # 리스트의 끝에서부터 10개를 가져오기 때문에

    for date in dates[start_index:]:
        notice_date = date.text.strip().replace('.','-')
        if base_date <= notice_date:
            date_index += 1
        else:
            break

    notices = soup\
        .find('table', class_='lc06')\
        .find_all('td', class_='views-field-title')\
        [start_index:start_index+date_index]

    for notice in notices:
        uri = notice.find('a').get('href')
        href = base_href + uri
        req = requests.get(href)
        html = req.text
        soup = BeautifulSoup(html, 'html.parser')

        params = params_parse_notice(soup=soup, href=href, board_id=board_id)
        result.append(parse_notice_eng(params))

    return result

def parse_notice_eng(params: params_parse_notice):
    soup = params.soup
    href = params.href
    board_id = params.board_id

    # 1. get the title of each notice
    title = soup.find('article', class_='tc03').find('h2').text.strip()

    # 2. get the created date of each notice
    created = soup.find('article', class_='tc03').find('p').text
    former, latter = created.split("등록일 : ") # 등록일 : 을 기준으로 split하면 end부분의 시작부분이 날짜가 댐
    created = ('20' + latter[0:8]).replace(".", "-")  # YYYY.MM.DD

    # 3. get the content of each notice
    content = soup.find('div', class_='even').text.strip()

    # print(title, created)

    # 4. return object of notice
    return Notice(title=title,
                  created=created,
                  content=content,
                  href=href,
                  board_id=board_id)

def get_base_date(board_id):
    # TO-DO: created에 대한 로직도 query로 처리해주면 좋겠음.

    filter_expression = Attr('board_id').eq(str(board_id))
    notices = scan(table_name='notices', filter_expression=filter_expression)

    base_date = '1900-01-01'

    if len(notices) > 0:
        for notice in notices:
            if notice['created'] > base_date:
                base_date = notice['created']

    return base_date

