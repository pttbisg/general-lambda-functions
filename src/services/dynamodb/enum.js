"use strict";

const AWS = {
    ACCESS_KEY: process.env.AWS_ACCESS_KEY_ID || "",
    SECRET_KEY: process.env.AWS_SECRET_KEY || "",
    DYNAMODB: {
        AIRTABLE_BE_EVENTS: "Airtable_BE_Events",
    }
}

const EVENT = {
    FROM: {
        BACKENDLESS: "BACKENDLESS",
    },
    EVENT_TYPE: {
        CREATE: "CREATE",
        UPDATE: "UPDATE",
        SOFT_DELETE: "SOFT_DELETE",
    }
}

module.exports = {
    AWS,
    EVENT,
}
