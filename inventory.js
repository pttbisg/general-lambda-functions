"use strict";

const {
    BackendlessService,
} = require('./services/backendless');

const {
    InventoryService,
} = require('./services/inventory');

const inventoryService = new InventoryService(
    new BackendlessService()
);

const getInventoryByUserIDLambdaFunc = async(event) => {
    try {
        console.log({
            message: "Incoming request",
            data: event,
        });

        const body = JSON.parse(event.body);

        const result = await inventoryService.getInventoryByUserID(body.userObjectID);

        let res = {
            statusCode: 200,
            body: JSON.stringify(result),
        };
      
        console.log({
            message: "Outgoing response",
            data: res,
        });
      
        return res;

    } catch(err) {
        console.log(err);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "INTERNAL_SERVER_ERROR",
            }),
        };
    }
}

module.exports = {
    getInventoryByUserIDLambdaFunc,
}
