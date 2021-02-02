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

def lambda_handler(event=None, context=None):
  def insert(table_name, items):
    dynamoDB = boto3.resource('dynamodb')
    table = dynamoDB.Table(table_name)

    try:
      if len(items):
        table.put_item(Item=items)
        return True

      for item in items:
        table.put_item(Item=item)

      return True

    except Exception as e:
      print('Error occured... ', e)
      return False

  kakao_id = event["userRequest"]["user"]["id"]

  dynamoDB = boto3.resource('dynamodb')
  table = dynamoDB.Table('users')

  response = table.query(
    KeyConditionExpression=Key('kakao_id').eq(kakao_id)
  )

  if response['Count'] == 0:
    insert(table_name='users', items=({'kakao_id': kakao_id}))

  return {
    'body': json.dumps(response)
  }

  # items = response['Items']
  # print(items[0]['name'])

  # utterance = event["userRequest"]["utterance"]
  #
  # ids = utterance.split(",")
  # for idx in range(len(ids)):
  #   ids[idx] = ids[idx].strip()
  #
  # print(ids)

  #     # for notice in notices:
  #     #     answer.append(notice.__dict__)
  #     # answer = json.dumps(answer)
  #
  #     # kakao_id = json.loads(event['kakao_id'])
  #     # insert(table_name='users', items=[{'kakao_id': str(kakao_id)}, {'kakao_id': '2'}])
  #
  #     user_id = event["userRequest"]["user"]["id"]
  #     kakao_id = event["action"]["params"]["kakao_id"]
  #     # request_body = json.loads(event["userRequest"])
  #     # params = request_body['action']['params']
  #     # kakao_id = params['kakao_id']

  #     return {
  #         'body': json.dumps({"kakao_id": user_id})
  #     }
  #
  # # result = lambda_handler()
  # # answer = result['body']
  # # print(answer)
  #
  # print(lambda_handler(event=event)['body'])

lambda_handler(event=event)
