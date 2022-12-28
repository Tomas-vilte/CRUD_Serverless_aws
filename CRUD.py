import boto3
import json
import logging
from custom_encoder import CustomEncoder

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodbTableName = 'tablaPersonas'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamodbTableName)


healthPath = '/health'
personPath = '/person'
personsPath = '/persons'
personById = '/persons/{idPersona}'


def lambda_handler(event, context):
    logger.info(event)
    httpMethod = event['httpMethod']
    path = event['path']
    resource = event['resource']

    if httpMethod == 'GET' and path == healthPath:
        return buildResponse(200)
    elif httpMethod == 'GET' and path == personById:
        return getPerson(event['pathParameters']['idPersona'])
    elif httpMethod == 'GET' and path == personsPath:
        return getPersons()
    elif httpMethod == 'POST' and path == personPath:
        return savePerson(json.loads(event['body']))
    elif httpMethod == 'PATCH' and path == personPath:
        requestBody = json.loads(event['body'])
        return modifyPerson(requestBody['idPersona'], requestBody['updateKey'], requestBody['updateValue'])
    elif httpMethod == 'DELETE' and path == personPath:
        requestBody = json.loads(event['body'])
        return deletePerson(requestBody['idPersona'])
    else:
        return buildResponse(404, 'Not found')

def getPerson(id):
    try:
        response = table.get_item(
            Key={
                'idPersona': id
            }
        )
        if 'Item' in response:
            return buildResponse(200, response['Item'])
        else:
            return buildResponse(404, {'Message': 'id: %s not found' % id})
    except Exception as e:
        logger.error(f'Error getting person: {e}')


def getPersons():
    try:
        response = table.scan()
        result = response['Items']

        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            result.extend(response['Items'])

        body = {
            'persons': result
        }
        return buildResponse(200, body)
    except Exception as e:
        logger.exception(f'Error getting people: {e}')


def savePerson(requestBody):
    try:
        table.put_item(Item=requestBody)
        body = {
            'Operacion': 'Guardada',
            'Mensaje': 'Exito',
            'Item': requestBody
        }
        return buildResponse(200, body)
    except Exception as e:
        logger.exception(f'Failed to save person: {e}')


def modifyPerson(id, updateKey, updateValue):
    try:
        response = table.update_item(
            Key={
                'idPersona': id

            },
            UpdateExpression='set %s = :value' % updateKey,
            ExpressionAttributeValues={
                ':value': updateValue
            },
            ReturnValues='UPDATED_NEW'
        )
        body = {
            'Operation': 'UPDATE',
            'Message': 'SUCCESS',
            'UpdatedAttributes': response
        }
        return buildResponse(200, body)
    except Exception as e:
        logger.exception(f'Error modifying person: {e}')


def deletePerson(id):
    try:
        response = table.delete_item(
            Key={
                'idPersona': id
            },
            ReturnValues='ALL_OLD'
        )
        body = {
            'Operation': 'DELETE',
            'Message': 'SUCCESS',
            'deletedItem': response
        }
        return buildResponse(200, body)
        
    except Exception as e:
        logger.exception(f'Error deleting person: {e}')


def buildResponse(statusCode, body=None):
    response = {
        'statusCode': statusCode,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
    if body is not None:
        response['body'] = json.dumps(body, cls=CustomEncoder)
    return response
