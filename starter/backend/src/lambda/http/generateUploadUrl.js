import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../auth/utils.mjs'
import {
  generateImageUrlAction
} from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const userId = getUserId(event)

    const todoId = event.pathParameters.todoId
    const uploadUrl = await generateImageUrlAction(userId, todoId)
    return JSON.stringify({
      uploadUrl
    })
  })
