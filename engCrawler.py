from Common import *

def main():
    url_list = [
        #"https://eng.snu.ac.kr/notice", # 공지사항
        #"https://eng.snu.ac.kr/janghak", # 장학알림
        #"https://eng.snu.ac.kr/recruit" # 취업광장
        "https://eng.snu.ac.kr/notice?keys=&page=193&title="
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
    input_date = '2006-01-01'  # 라고 임의의 값

    while True:
        noti_date_list = driver.find_elements_by_class_name('views-field-created')
        start_index = len(noti_date_list) - 10 # 리스트의 끝에서부터 10개를 가져오기 때문에

        for noti_date in noti_date_list[start_index:]:
            if compare_date(input_date, noti_date.text) == -1:
                break
            date_index += 1

        noti_list = driver.find_element_by_class_name('lc06').find_elements_by_class_name('views-field-title')

        for noti in noti_list[start_index:start_index + date_index]:
            href_list.append(noti.find_element_by_tag_name('a').get_attribute('href'))

        for href in href_list:  # 받아온 href에 대해 반복문
            result_data, driver = get_data(href, driver)
            data_table_list.append(result_data)

            driver.back()  # 뒤로가기
            time.sleep(1)

        #DB 저장하는 함수로 바꾸기?
        for data in data_table_list:
            print_data(data)
        #insert_data(data_table_list)

        if date_index == 10:
            del noti_date_list[:]
            del href_list[:]
            date_index = 0
            driver.find_element_by_class_name('pager-next').find_element_by_css_selector('a').send_keys(Keys.ENTER)
            time.sleep(1)
        else:
            break

    driver.close()
    del noti_date_list[:]
    del href_list[:]

def insert_data(data_table_list):
    db = boto3.resource('dynamodb')
    db_table = db.Table('test')

    for data in data_table_list:
        db_table.put_item(
            Item = {
                'noti_title' : data.title,
                'noti_created' : data.created,
                'noti_content' : data.content,
                'noti_source' : data.source
            }
        )


def get_data(href, driver):
    temp = dataObject()
    # 1. 어느사이트의 어느공지게시판인지 가져오기
    temp.source = driver.find_element_by_class_name('lc04').find_element_by_class_name('active').text
    time.sleep(1)
    # href로 이동 후 크롤링
    driver.get(href)
    time.sleep(1)
    # 2. 제목 가져오기
    temp.title = driver.find_element_by_class_name('tc03').find_element_by_tag_name('h2').text
    # 3. 작성일 가져오기
    temp.created = driver.find_element_by_class_name('tc03').find_element_by_tag_name('p').text

    # parsing
    front, end = temp.created.split("등록일 : ") # 등록일 : 을 기준으로 split하면 end부분의 시작부분이 날짜가 댐
    temp.created = ('20' + end[0:8]).replace(".", "-") #YYYY.MM.DD
    # 4. 내용 가져오기
    temp.content = driver.find_element_by_class_name('even').text
    # 5. return
    return temp, driver

main()
