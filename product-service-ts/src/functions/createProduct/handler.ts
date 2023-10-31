import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway'
import { formatJSONResponse } from '@libs/api-gateway'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

const client = new DynamoDBClient()
const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
})

const updateProductsTable = async (params) => {
    const command = new PutCommand({
        TableName: process.env.PRODUCTS_TABLE,
        Item: params,
    })

    await docClient.send(command)
}

const updateProductsStockTable = async (params) => {
    const command = new PutCommand({
        TableName: process.env.PRODUCTS_STOCK_TABLE,
        Item: params,
    })

  await docClient.send(command)
}

const createProduct: ValidatedEventAPIGatewayProxyEvent<any> = async (
    event,
    context,
    callback
) => {
    let body = {}
    let statusCode = 200

    //@ts-ignore
    const payload = JSON.parse(event.body)
    console.log('createProduct called!', payload)
    console.log('createProduct called!', event)

    if (payload.title === undefined) {
        callback(null, {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Product data is invalid. Title is missing',
            }),
        })
    }

    if (payload.description === undefined) {
        callback(null, {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Product data is invalid. Description is missing',
            }),
        })
    }

    if (payload.price === undefined) {
        callback(null, {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Product data is invalid. Price is missing',
            }),
        })
    }

    if (payload.count === undefined) {
        callback(null, {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Product data is invalid. Count is missing',
            }),
        })
    }

    const productId = uuidv4()
    const product = {
        id: productId,
        title: payload.Title,
        description: payload.Description,
        price: payload.Price,
        image: payload.Image || '',
    }

    const productStockData = {
        product_id: productId,
        count: payload.Count,
    }
    console.log('product ', product)
    console.log('productStockData ', productStockData)
    
    try {
        await updateProductsTable(product)
        await updateProductsStockTable(productStockData)     
    } catch (error) {
        console.log('[createProduct] Something went wrong! ' + product.title , error)
    }
   

    body = {
        data: 'Product created with id: ' + productId,
    }

    return formatJSONResponse(body, statusCode)
}
export const main = createProduct
