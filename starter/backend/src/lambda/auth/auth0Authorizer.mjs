import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

// const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

const client = jwksClient({
  jwksUri: 'https://dev-ptqwjo0ply28yy5y.us.auth0.com/.well-known/jwks.json'
})

export async function handler(event) {
  try {
    // console.log('event: ', event)
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  console.log('authHeader: ', authHeader)
  const token = getToken(authHeader)

  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, function(err, key) {
      if (err) {
        console.log('Error getting signing key:', err);
      }
      // console.log('key: ', key)
      const signingKey = key.publicKey || key.rsaPublicKey
      callback(null, signingKey)
    })
  }

  // console.log('getKey: ', getKey)

  // const jwt = jsonwebtoken.decode(token, { complete: true })

  const decodedJwt = await new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, getKey, { algorithms: ['RS256'] }, (error, decoded) => {
      if (error) {
        reject(error)
      } else {
        resolve(decoded)
      }
    })
  })

  return decodedJwt;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
