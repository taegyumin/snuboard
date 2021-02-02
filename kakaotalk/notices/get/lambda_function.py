import json
import boto3
from boto3.dynamodb.conditions import Key

event = {
  "intent": {
    "id": "5h5izzgqkwl1p0ha3e9t377n",
    "name": "블록 이름"
  },
  "userRequest": {
    "timezone": "Asia/Seoul",
    "params": {
      "ignoreMe": "true"
    },
    "block": {
      "id": "5h5izzgqkwl1p0ha3e9t377n",
      "name": "블록 이름"
    },
    "utterance": "0,1 , 2,3 ",
    "lang": None,
    "user": {
      "id": "080405",
      "type": "accountId",
      "properties": {}
    }
  },
  "bot": {
    "id": "5f0d59ad9aa73a0001977e88",
    "name": "봇 이름"
  },
  "action": {
    "name": "05rvll8yoa",
    "clientExtra": None,
    "params": {
      "boards": "0,1,2"
    },
    "id": "3irv1zemmt2tcdunoe2zxwb2",
    "detailParams": {
      "boards": {
        "origin": "0,1,2",
        "value": "0,1,2",
        "groupName": ""
      }
    }
  }
}
from datetime import date

def lambda_handler(event=None, context=None):

  kakao_id = event["userRequest"]["user"]["id"]

  dynamoDB = boto3.resource('dynamodb')
  table = dynamoDB.Table('users')

  response = table.query(
    KeyConditionExpression=Key('kakao_id').eq('0')
  )

  item = response['Items'][0]
  boards = item['filter']['boards']

  today = str(date.today())

  dynamoDB = boto3.resource('dynamodb')
  table = dynamoDB.Table('notices')

  response = table.query(
      KeyConditionExpression=Key('created').eq('2020-08-09')
  )
  # print(response['Count'])

  if response['Count'] == 0:
      return {
        'body': json.dumps('오늘 올라온 공지사항이 없습니다.')
      }

  result = []

  items = response['Items']
  if len(items) == 1:
      if item['board_id'] in boards:
          result.append(item['content'])
  else:
      for item in items:
          if item['board_id'] in boards:
              result.append(item['content'])

  return {
    'body': json.dumps(result)
  }

print(lambda_handler(event=event))