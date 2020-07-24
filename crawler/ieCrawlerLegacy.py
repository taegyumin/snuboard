from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from crawler.common import get_base_date
import datetime as dt

def compare_date(base_date: str, comparison_date: str):
    base_date = dt.datetime(int(base_date[0:4]), int(base_date[5:7]), int(base_date[8:10]))
    comparison_date = dt.datetime(int(comparison_date[0:4]), int(comparison_date[5:7]), int(comparison_date[8:10]))

    # 계속 비교를 진행해야 하면 return 1 비교를 멈춰야 한다면 -1
    if base_date <= comparison_date:
        return 1
    else:
        return -1

def crawlIE(path):
    url_list = [
        "http://ie.snu.ac.kr/ko/board/6",  # 취업
        "http://ie.snu.ac.kr/ko/board/7",  # 학부
        "http://ie.snu.ac.kr/ko/board/8",  # 대학원
        "http://ie.snu.ac.kr/ko/board/15"  # 장학금
    ]

    base_date = get_base_date(1)

    for url in url_list:
        crawl(url, path, base_date)

def crawl(url, path, base_date):
    href_list = []
    noti_date_list = []
    data_table_list = []
    date_index = 0

    # 1. 크롬 열기
    options = webdriver.ChromeOptions()
    #options.add_argument('headless')
    options.add_argument("--disable-gpu")
    options.add_argument('lang=ko_KR')
    driver = webdriver.Chrome(path, options=options)
    time.sleep(2)

    # 2. url 이동
    driver.get(url)
    time.sleep(2)

    # 3. 긁어올 공지사항들의 링크 목록 (herf_list) 가져오기
    while True:
        notice_date_list = driver.find_elements_by_class_name('views-field-created')

        for notice_date in notice_date_list[1:]:
            notice_date = notice_date.text
            if compare_date(base_date, notice_date) == -1:
                break
            date_index += 1

        noti_list = driver.find_element_by_class_name('table').find_elements_by_class_name('views-field-title-field')
        for noti in noti_list[1:date_index+1]:
            href_list.append(noti.find_element_by_tag_name('a').get_attribute('href'))

        for href in href_list:  # 받아온 href에 대해 반복문
            result_data, driver = get_data(href, driver)
            data_table_list.append(result_data)

            driver.back()  # 뒤로가기
            time.sleep(1)

        insert_notices_into_dynamoDB(data_table_list)

        if date_index == 10:
            del noti_date_list[:]
            del href_list[:]
            del data_table_list
            date_index = 0
            driver.find_element_by_class_name('next').find_element_by_css_selector('a').send_keys(Keys.ENTER)
            time.sleep(1)
        else:
            break

    driver.close()
    del data_table_list
    del noti_date_list[:]
    del href_list[:]

def get_data(href, driver):

    # 1. 어느사이트의 어느공지게시판인지(kind) 가져오기
    kind = driver.find_element_by_class_name('easy-breadcrumb_segment-title').text
    time.sleep(1)

    # href로 이동 후 크롤링
    driver.get(href)
    time.sleep(2)

    # 2. 제목 가져오기
    title = driver.find_element_by_class_name('field-group-div').find_element_by_tag_name('h2').text

    # 3. 작성일 가져오기
    created = driver.find_element_by_class_name(
        'field-name-post-date').find_element_by_class_name('even').text[0:10]

    # 4. 내용 가져오기
    content = driver.find_element_by_class_name('field-name-body').text

    # 5. return
    return notice(title=title, created=created, content=content, kind=kind), driver

if __name__=="__main__":
    crawlIE(path="/chromedriver")
