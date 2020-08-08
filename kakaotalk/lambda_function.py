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

event = {
  "intent": {
    "id": "7gxb29dn2ptqrxxu2bseja51",
    "name": "블록 이름"
  },
  "userRequest": {
    "timezone": "Asia/Seoul",
    "params": {
      "ignoreMe": "true"
    },
    "block": {
      "id": "7gxb29dn2ptqrxxu2bseja51",
      "name": "블록 이름"
    },
    "utterance": "발화 내용",
    "lang": None,
    "user": {
      "id": "247286",
      "type": "accountId",
      "properties": {}
    }
  },
  "bot": {
    "id": "5f0d59ad9aa73a0001977e88",
    "name": "봇 이름"
  },
  "action": {
    "name": "t2we4d5qzs",
    "clientExtra": None,
    "params": {
      "kakao_id": "3"
    },
    "id": "079u0x4o9r920ybp3c6ut5rc",
    "detailParams": {
      "kakao_id": {
        "origin": "3",
        "value": "3",
        "groupName": ""
      }
    }
  }
}