"use strict";

const AwsSdk = require('aws-sdk');
const { v4 } = require('uuid');
const uuidv4 = v4;

const { AWS, EVENT } = require('./enum');

class DynamoDBService {
    constructor() {
        this.dynamoDBClient = new AwsSdk.DynamoDB.DocumentClient({
            region: "us-west-2",
            accessKey: AWS.ACCESS_KEY,
            secretAccessKey: AWS.SECRET_KEY,
        });
    }

    async insert(items, eventType) {
        const params = {
            TableName: AWS.DYNAMODB.AIRTABLE_BE_EVENTS,
            Item: {
                id: uuidv4(),
                created: new Date().toISOString(),
                event_from: EVENT.FROM.BACKENDLESS,
                event_type: eventType,
                event_payload: JSON.stringify(items),
                is_origin_from_be: true,
                is_migrated: false,
            },
        }

        return await this.dynamoDBClient.put(params).promise();
    }
}

module.exports = {
    DynamoDBService,
}
