from dynamoDB import scan, insert, scan_all
from crawler.common import Board, Department, User
from crawler.common import crawl
from boto3.dynamodb.conditions import Attr

# board0 = Board(id='0', name='취업', uri='/ko/board/6', department_id='0')
# board1 = Board(id='1', name='학부', uri='/ko/board/7', department_id='0')
# board2 = Board(id='2', name='대학원', uri='/ko/board/8', department_id='0')
# board3 = Board(id='3', name='장학금', uri='/ko/board/15', department_id='0')
# board4 = Board(id='4', name='공지사항', uri='/notice', department_id='1')
# board5 = Board(id='5', name='장학알림', uri='/janghak', department_id='1')
# board6 = Board(id='6', name='취업광장', uri='/recruit', department_id='1')
# boards = (board0,board1,board2,board3,board4,board5,board6)
# insert(items=boards, table_name='boards')

# for _ in [0,1,2,3,4,5,6]:
#     notices = crawl(board_id=str(_))
#     insert(items=notices, table_name='notices')

# ie = Department(id='0', name='산업공학과', base_href='http://ie.snu.ac.kr')
# eng = Department(id='1', name='공과대학', base_href='http://eng.snu.ac.kr')
# departments = (ie, eng)
# insert(items=departments, table_name='departments')

# schedule = {'mon': [{'time': '19:00', 'department': 0, 'board': 0}],
#             'tue': [],
#             'wed': [{'time': '19:00', 'department': 0, 'board': 0}],
#             'thu': [],
#             'fri': [{'time': '19:00', 'department': 0, 'board': 0}]
#         }
# filter = {
#             'include_keywords' : ['장학'],
#             'exclude_keywords' : ['취업']
#          }
# user1 = [User(kakao_id='0', schedule=schedule, filter=filter)]
# insert(items=user1,table_name='users')

# filter_expression = Attr('department_id').eq('0')
# table_name = 'boards'
# scan(filter_expression=filter_expression, table_name=table_name)
#
# filter_expression = Attr('department_id').eq('0')
# boards = scan(filter_expression=filter_expression, table_name='boards')
#
# filter_expression = Attr('id').eq('0')
# ie = scan(filter_expression=filter_expression, table_name='departments')