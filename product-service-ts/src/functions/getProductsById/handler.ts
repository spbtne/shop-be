import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway'
import { formatJSONResponse } from '@libs/api-gateway'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient()
const docClient = DynamoDBDocumentClient.from(client)

const productsTable = async (id) => {
    const command = new GetCommand({
        TableName: process.env.PRODUCTS_TABLE,
        Key: {
            id,
        },
    })

    const response = await docClient.send(command)
    return response
}

const productsStockTable = async (id) => {
    const command = new GetCommand({
        TableName: process.env.PRODUCTS_STOCK_TABLE,
        Key: {
            product_id: id,
        },
    })

    const response = await docClient.send(command)
    return response
}

const getProductsById: ValidatedEventAPIGatewayProxyEvent<any> = async (
    event
) => {
    let body = {}
    let statusCode = 200
    try {
        const productId = event.pathParameters.productId
        const product = await productsTable(productId)
        const productsStock = await productsStockTable(productId)

        body = {
            ...product.Item,
            count: productsStock.Item.count,
        }
    } catch (error) {
        statusCode = 400
        body = { error: 'Product not found' }
    }
    return formatJSONResponse(body)
}
export const main = getProductsById
