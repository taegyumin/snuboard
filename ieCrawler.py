from Common import *


def main():
    url_list = [
        "http://ie.snu.ac.kr/ko/board/6",  # 취업
        "http://ie.snu.ac.kr/ko/board/7",  # 학부
        "http://ie.snu.ac.kr/ko/board/8",  # 대학원
        "http://ie.snu.ac.kr/ko/board/15"  # 장학금
    ]
    path = "C:/Users/sjh08/PycharmProjects/SNUBoard/chromedriver.exe"

    for url in url_list:
        crawl(url, path)


def crawl(url, path):
    href_list = []
    noti_date_list = []
    data_table_list = []
    date_index = 0
    # 1. 크롬열기
    driver = webdriver.Chrome(path)
    # 2. url 이동
    driver.get(url)
    time.sleep(1)

    # 3. 긁어올 공지사항의 herf_list 가져오기
    input_date = '2020-06-25'  # 라고 임의의 값

    while True:
        noti_date_list = driver.find_elements_by_class_name('views-field-created')

        for noti_date in noti_date_list[1:]:
            if compare_date(input_date, noti_date.text) == -1:
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

        insert_data(data_table_list)

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
    temp = dataObject()
    # 1. 어느사이트의 어느공지게시판인지 가져오기
    temp.source = driver.find_element_by_class_name('easy-breadcrumb_segment-title').text
    time.sleep(1)
    # href로 이동 후 크롤링
    driver.get(href)
    time.sleep(1)
    # 2. 제목 가져오기
    temp.title = driver.find_element_by_class_name('field-group-div').find_element_by_tag_name('h2').text
    # 3. 작성일 가져오기
    temp.created = driver.find_element_by_class_name('field-name-post-date').find_element_by_class_name('even').text
    # 4. 내용 가져오기
    temp.content = driver.find_element_by_class_name('field-name-body').text
    # 5. return
    return temp, driver

main()

