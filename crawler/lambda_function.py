from crawler.common import crawl
from dynamoDB import insert
import boto3

def lambda_handler(event=None, context=None):
    notices = []
    # answer = []

    dynamoDB = boto3.resource('dynamodb')
    table = dynamoDB.Table('boards')
    response = table.scan()
    boards = response['Items']

    board_ids = []
    for board in boards:
        board_ids.append(board['id'])
    board_ids = sorted(board_ids)

    for board_id in board_ids:
        notices += (crawl(board_id=str(board_id)))

    insert('notices', items=notices)

    return notices
