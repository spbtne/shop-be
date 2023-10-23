import type { AWS } from '@serverless/typescript'

import { importProductsFile } from '@functions/index'
import importFileParser from '@functions/importFileParser'

const serverlessConfiguration: AWS = {
    service: 'import-service',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild'],
    provider: {
        name: 'aws',
        runtime: 'nodejs18.x',
        region: 'eu-west-1',
        profile: 'instructor',
        stage: 'dev',
        httpApi: {
          cors: true
        },
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
        },
        iam: {
            role: {
                statements: [
                    {
                        Effect: 'Allow',
                        Action: ['s3:*'],
                        Resource: [
                            'arn:aws:s3:::epam-aws-training-import/*',
                            'arn:aws:s3:::epam-aws-training-import',
                        ],
                    },
                ],
            },
        },
    },
    functions: { importProductsFile, importFileParser },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: true,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node18',
            define: { 'require.resolve': undefined },
            platform: 'node',
            concurrency: 10,
        },
    },
}

module.exports = serverlessConfiguration
