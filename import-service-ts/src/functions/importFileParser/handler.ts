import { GetObjectCommand, S3 } from '@aws-sdk/client-s3'
import { Handler, S3Event } from 'aws-lambda'
import csvParser from 'csv-parser'
import { Readable } from 'stream'

const importFileParser: Handler<S3Event> = async (event) => {
    try {
        const s3 = new S3({ region: 'eu-west-1' })
        const results = []

        for (const record of event.Records) {
            console.log('importFileParser record', record)
            const fileName = record.s3.object.key
            const params = { Bucket: 'epam-aws-training-import', Key: fileName }
            const movedFileOptions = {
                Bucket: 'epam-aws-training-import',
                CopySource: 'epam-aws-training-import/' + fileName,
                Key: fileName.replace('uploaded', 'parsed'),
            }
            const s3StreamBody = (await s3.send(new GetObjectCommand(params)))
                .Body

            if (!(s3StreamBody instanceof Readable)) {
                throw new Error(`Unable to read stream!`)
            }
            await new Promise<void>((resolve) => {
                s3StreamBody
                    .pipe(
                        csvParser({
                            headers: [
                                'Title',
                                'Description',
                                'Price',
                                'Count',
                                'Rate',
                                'Category',
                                'Image',
                            ],
                        })
                    )
                    .on('data', (data: any) => results.push(data))
                    .on('end', async () => {
                        console.log('parser stream results', results)
                        await s3.copyObject(movedFileOptions);
                        console.log('File moved csv to parsed location')
                        await s3.deleteObject(params);
                        console.log('File deleted from uploaded location')
                        resolve()
                    })
            })
        }
    } catch (err) {
        console.log('importFileParser error', err?.message)
    }
}

export const main = importFileParser
