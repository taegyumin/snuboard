class Notices:
    def __init__(self, notices):
        self.notices = notices

class Notice:
    def __init__(self, created, title, content, href, board_id):
        self.created = created
        self.title = title
        self.content = content
        self.href = href
        self.board_id = board_id
        # self.files
        # self.images

class Board:
    def __init__(self, id, name, uri, department_id):
        self.id = id
        self.name = name
        self.uri = uri
        self.department_id = department_id

class Department:
    def __init__(self, id, name, base_href):
        self.id = id
        self.name = name
        self.base_href = base_href

class User:
    def __init__(self, kakao_id, schedule, filter):
        self.kakao_id = kakao_id
        self.schedule = schedule
        self.filter = filter

class params_parse_notices:
    def __init__(self, soup, base_date, base_href, department_id, board_id):
        self.soup = soup
        self.base_date = base_date
        self.base_href = base_href
        self.department_id = department_id
        self.board_id = board_id

class params_parse_notice:
    def __init__(self, soup, href, board_id):
        self.soup = soup
        self.href = href
        self.board_id = board_id
