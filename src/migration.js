"use strict";

const _ = require('lodash');

const {
    PostgresMigrationService,
} = require('./services/postgres');

const postgresMigrationService = new PostgresMigrationService();

const up = async(event) => {
    let resStatus;
    let resBody;

    try {
        console.log({
            message: "Incoming request",
            data: JSON.parse(event.body),
            pathParameters: _.get(event, "pathParameters"),
        });

        await postgresMigrationService.up();

        resStatus = 200;
        resBody = JSON.stringify({
            "message": "Migration up success",
        });

    } catch(err) {
        console.log(err);
        console.error(err.toJSON());

        resStatus = 500;
        resBody = JSON.stringify({
            "message": "Failed to insert record",
        });

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
}

const force = async(event) => {
    let resStatus;
    let resBody;

    try {
        console.log({
            message: "Incoming request",
            data: JSON.parse(event.body),
            pathParameters: _.get(event, "pathParameters"),
        });

        const migrationVersion = _.get(event, "pathParameters.version")

        await postgresMigrationService.force(migrationVersion);

        resStatus = 200;
        resBody = JSON.stringify({
            "message": `Migration force to version ${migrationVersion} success`,
        });

    } catch(err) {
        console.log(err);
        console.error(err.toJSON());

        resStatus = 500;
        resBody = JSON.stringify({
            "message": "Failed to insert record",
        });

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
}

const goto = async(event) => {
    let resStatus;
    let resBody;

    try {
        console.log({
            message: "Incoming request",
            data: JSON.parse(event.body),
            pathParameters: _.get(event, "pathParameters"),
        });

        const migrationVersion = _.get(event, "pathParameters.version")

        await postgresMigrationService.goto(migrationVersion);

        resStatus = 200;
        resBody = JSON.stringify({
            "message": `Migration goto version ${migrationVersion} success`,
        });

    } catch(err) {
        console.log(err);
        console.error(err.toJSON());

        resStatus = 500;
        resBody = JSON.stringify({
            "message": "Failed to insert record",
        });

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
}

module.exports = {
    up,
    force,
    goto,
}
