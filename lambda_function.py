import json
from crawler.common import crawl
from dynamoDB import insert

def lambda_handler(event=None, context=None):
    notices = []
    # answer = []

    for board_id in [0, 1, 2, 3, 4, 5, 6]:
        notices += (crawl(board_id=str(board_id)))

    insert('boards', items=notices)

    # for notice in notices:
    #     answer.append(notice.__dict__)

    # answer = json.dumps(answer)

    return {
        'body': json.dumps('true')
    }

# result = lambda_handler()
# answer = result['body']
# print(answer)