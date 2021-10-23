"use strict";

const AWSXray = require("aws-xray-sdk");
AWSXray.captureHTTPsGlobal(require("http"));
AWSXray.captureHTTPsGlobal(require("https"));

const { BackendlessService } = require("./services/backendless");

const { InventoryService } = require("./services/inventory");

const inventoryService = new InventoryService(new BackendlessService());

const getInventoryByUserIDLambdaFunc = async (event) => {
  try {
    console.log({
      message: "Incoming request",
      // data: JSON.parse(event.body),
    });

    const body = JSON.parse(event.body);
    // const body = event;

    const result = await inventoryService.getInventoryByUserID(
      body.userObjectID
    );

    let res = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify(result),
    };
    // let res = {
    //     statusCode: 200,
    //     body: result,
    // };

    console.log({
      message: "Outgoing response",
      data: res,
    });

    return res;
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "INTERNAL_SERVER_ERROR",
      }),
    };
  }
};

module.exports = {
  getInventoryByUserIDLambdaFunc,
};
