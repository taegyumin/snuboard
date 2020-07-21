import datetime as dt
import boto3
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time


class dataObject:
    def __init__(self, title=None, created=None, content=None, source=None):
        self.title = title
        self.created = created
        self.content = content
        self.source = source


def compare_date(select_date: str, noti_created: str):  # 계속 비교를 진행해야 하면 return 1 비교를 멈춰야 한다면 -1
    select = dt.datetime(int(select_date[0:4]), int(select_date[5:7]), int(select_date[8:10]))
    noti = dt.datetime(int(noti_created[0:4]), int(noti_created[5:7]), int(noti_created[8:10]))

    if select > noti:
        return -1
    else:
        return 1


def print_date(select_date: str):
    print(int(select_date[0:4]))
    print(int(select_date[5:7]))
    print(int(select_date[8:10]))


def print_data(result):
    print('[' + result.title + '\n' + result.created + '\n' + result.content + '\n' + result.source + ']\n')


def insert_data(data_table_list):
    dynamodb = boto3.resource('dynamodb')

    table = dynamodb.Table('notices')

    for data in data_table_list:
        table.put_item(
            Item={
                'created': data.created,
                'title': data.title,
                'content': data.content,
                'source': data.source,
            }
        )

    table.meta.client.get_waiter('table_exists').wait(TableName='notices')
    print('insert_data()')


