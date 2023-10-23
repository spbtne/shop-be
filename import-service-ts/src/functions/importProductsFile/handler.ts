import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
    ValidatedEventAPIGatewayProxyEvent,
    formatJSONResponse,
} from '@libs/api-gateway'

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<any> = async (
    event,
    context,
    callback
) => {
    console.info(`importProductsFile. Incoming event: ${JSON.stringify(event)}`)
    const fileName = event.queryStringParameters.name
    const s3Params = {
        Bucket: 'epam-aws-training-import',
        Key: `uploaded/${fileName}`,
    }
    const s3 = new S3Client({ region: 'eu-west-1' })
    const command = new PutObjectCommand(s3Params)

    try {
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

        return formatJSONResponse(signedUrl)
    } catch (err) {
        callback(err)
    } finally {
        s3.destroy()
    }
}
export const main = importProductsFile
