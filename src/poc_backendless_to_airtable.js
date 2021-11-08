"use strict";

const _ = require('lodash');

const { POCBackendlessToAirtableService } = require('./services/backendless');
const { DynamoDBService } = require('./services/dynamodb');
const { EVENT } = require('./services/dynamodb/enum');
const { AirtableTestAirtableBackendlessService } = require('./services/airtable');

const pocService = new POCBackendlessToAirtableService();
const dynamoDBService = new DynamoDBService();
const airtableService = new AirtableTestAirtableBackendlessService();


const insert = async(event) => {
    let resBody;
    let resStatus;

    try {
        console.log({
            message: "Incoming request",
            body: JSON.parse(event.body),
        });

        const body = JSON.parse(event.body);

        const beRes = await pocService.insert(pocService.buildBackendlessPayload(
            body.booleanColumn, body.dateColumn, body.formulaColumn, 
            body.numberColumn, body.phoneColumn, 
            body.singleSelectColumn, body.stringColumn,
        ));

        const airtablePayload = airtableService.buildInsertPayload(beRes);
        await dynamoDBService.insert(airtablePayload, EVENT.EVENT_TYPE.CREATE);

        resStatus = 201;
        resBody = JSON.stringify(beRes);
    } catch(err) {
        console.log(err);
        console.error(err.toJSON());

        resStatus = 500;
        resBody = JSON.stringify({
            "message": "Failed to insert record",
        })
    } finally {
        console.log({
            message: "Outgoing response",
            status: resStatus,
            body: resBody,
        });

        return {
            statusCode: resStatus,
            body: resBody,
        }
    }
};

const update = async(event) => {
    let resBody;
    let resStatus;

    try {
        console.log({
            message: "Incoming request",
            body: JSON.parse(event.body),
            pathParameters: _.get(event, "pathParameters"),
        });

        const id = _.get(event, "pathParameters.id");
        const body = JSON.parse(event.body);

        const beRes = await pocService.update(id, pocService.buildBackendlessPayload(
            body.booleanColumn, body.dateColumn, body.formulaColumn, 
            body.numberColumn, body.phoneColumn, 
            body.singleSelectColumn, body.stringColumn,
        ));

        if(beRes['airtable_id'] !== null) {
            const airtablePayload = airtableService.buildUpdatePayload(beRes);
            await dynamoDBService.insert(airtablePayload, EVENT.EVENT_TYPE.UPDATE);
        }

        resStatus = 200;
        resBody = JSON.stringify(beRes);
    } catch(err) {
        console.log(err);
        console.error(err.toJSON());

        resStatus = 500;
        resBody = JSON.stringify({
            "message": "Failed to insert record",
        })
    } finally {
        console.log({
            message: "Outgoing response",
            status: resStatus,
            body: resBody,
        });

        return {
            statusCode: resStatus,
            body: resBody,
        }
    }
};

const soft_delete = async(event) => {
    let resBody;
    let resStatus;

    try {
        console.log({
            message: "Incoming request",
            pathParameters: _.get(event, "pathParameters"),
        });

        const id = _.get(event, "pathParameters.id");

        const beRes = await pocService.softDelete(id);

        if(beRes['airtable_id'] !== null) {
            const airtablePayload = airtableService.buildSoftDeletePayload(beRes);
            await dynamoDBService.insert(airtablePayload, EVENT.EVENT_TYPE.SOFT_DELETE);
        }

        resStatus = 204;
    } catch(err) {
        console.log(err);
        console.error(err.toJSON());

        resStatus = 500;
        resBody = JSON.stringify({
            "message": "Failed to insert record",
        })
    } finally {
        console.log({
            message: "Outgoing response",
            status: resStatus,
            body: resBody,
        });

        return {
            statusCode: resStatus,
            body: resBody,
        }
    }
};

module.exports = {
    insert,
    update,
    soft_delete,
}
