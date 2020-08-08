from crawler.common import crawl
from dynamoDB import insert, scan_all

def lambda_handler(event=None, context=None):
    notices = []
    boards = scan_all('boards')

    board_ids = []
    for board in boards:
        board_ids.append(board['id'])

    for board_id in board_ids:
        notices += (crawl(board_id=str(board_id)))

    insert('notices', items=notices)

    return notices
