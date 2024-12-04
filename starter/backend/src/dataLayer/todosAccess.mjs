import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

const dynamoDB = new DynamoDB()
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDB)
const dynamodbClient = DynamoDBDocument.from(dynamoDbXRay)
// const dynamodbClient = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE
const todosByUserIndexTable = process.env.TODOS_BY_USER_INDEX

const getTodos = async (userId) => {
  const result = await dynamodbClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :i',
    ExpressionAttributeValues: {
      ':i': userId
    },
    ScanIndexForward: false
  })
  console.log('result: ', result)
  const items = result.Items
  return items
}

const createTodo = async (item) => {
  await dynamodbClient.put({
    TableName: todosTable,
    IndexName: todosByUserIndexTable,
    Item: item
  })
  return item
}

const checkHasExistedTodo = async (userId, name) => {
  const result = await dynamodbClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :i',
    FilterExpression: 'name = :name',
    ExpressionAttributeValues: {
      ':i': userId,
      ':name': name
    },
    ScanIndexForward: false
  })

  console.log('result: ', result)

  const item = result.Item
  return !!item
}

const updateTodo = async (userId, todoId, item) => {
  await dynamodbClient.update({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      ':name': item.name,
      ':dueDate': item.dueDate,
      ':done': item.done
    }
  })
}

const deleteTodo = async (userId, todoId) => {
  await dynamodbClient.delete({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    }
  })
}

const updateTodoImage = async (userId, todoId, uploadUrl) => {
  await dynamodbClient.update({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
    ExpressionAttributeNames: {
      '#attachmentUrl': 'attachmentUrl'
    },
    ExpressionAttributeValues: {
      ':attachmentUrl': uploadUrl
    }
  })
}

export {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  updateTodoImage,
  checkHasExistedTodo
}
