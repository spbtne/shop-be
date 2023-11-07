import { APIGatewayAuthorizerCallback } from 'aws-lambda'

import { APIGatewayAuthorizerResult } from 'aws-lambda'

enum Effect {
    Allow = 'Allow',
    Deny = 'Deny',
}

const generatePolicy = (
    principalId: string,
    resource: string,
    effect: Effect
): APIGatewayAuthorizerResult => ({
    principalId,
    policyDocument: {
        Version: '2012-10-17',
        Statement: [
            {
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource,
            },
        ],
    },
})

const basicAuthorizer = async (
    event,
    _context,
    callback: APIGatewayAuthorizerCallback
) => {
    if (event['type'] != 'TOKEN') callback(`Unauthorized`)
    try {
        const token = event.authorizationToken.split(' ')[1]
        console.log('Token: ', token)
        if (token === 'null') {
            const policy = generatePolicy(null, event.methodArn, Effect.Deny)

            callback(null, policy)
        }

        const [username, password] = Buffer.from(token, 'base64')
            .toString('utf-8')
            .split(':')
        const effect =
            !process.env[username] || process.env[username] !== password
                ? Effect.Deny
                : Effect.Allow
        const policy = generatePolicy(username, event.methodArn, effect)

        callback(null, policy)
    } catch (err) {
        callback(`Unauthorized: ${err.message}`)
    }
}
export const main = basicAuthorizer
