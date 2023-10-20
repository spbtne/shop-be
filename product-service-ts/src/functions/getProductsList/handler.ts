import {
    ValidatedEventAPIGatewayProxyEvent,
    formatJSONResponse,
} from '@libs/api-gateway'

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const client = new DynamoDBClient()
const docClient = DynamoDBDocumentClient.from(client)

docClient.middlewareStack

const productsTable = async () => {
    const command = new ScanCommand({
        TableName: process.env.PRODUCTS_TABLE,
    })

    const response = await docClient.send(command)
    return response
}

const productsStockTable = async () => {
    const command = new ScanCommand({
        TableName: process.env.PRODUCTS_STOCK_TABLE,
    })

    const response = await docClient.send(command)
    return response
}

const getProductsList: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {

    const products = await productsTable().then((res) =>
        res.Items.map((item) => unmarshall(item))
    )
    const productsStock = await productsStockTable().then((res) =>
        res.Items.map((item) => unmarshall(item))
    )

    const body = products.map((product) => {
        const stock = productsStock.find(
            (stock) => stock.product_id === product.id
        )
        return {
            ...product,
            count: stock?.count,
        }
    })

    return formatJSONResponse(body)
}

export const main = getProductsList
