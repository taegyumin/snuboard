import boto3

def insert(table_name, items):
        dynamoDB = boto3.resource('dynamodb')
        table = dynamoDB.Table(table_name)

        for item in items:
                table.put_item(Item=item.__dict__)

def scan(table_name, filter_expression):
        dynamoDB = boto3.resource('dynamodb')
        table = dynamoDB.Table(table_name)

        response = table.scan(
                FilterExpression=filter_expression
        )
        items = response['Items']
        return items

def scan_all(table_name):
        dynamoDB = boto3.resource('dynamodb')
        table = dynamoDB.Table(table_name)

        response = table.scan()
        items = response['Items']
        return items



