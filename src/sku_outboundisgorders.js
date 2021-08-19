"use strict";

const {
    BESKUInboundService,
    BESKUOutboundISGOrderService,
    BackendlessService,
} = require('./services/backendless');

const { 
    SKUOutboundISGOrderService,
} = require('./services/sku_outboundisgorders');

const skuOutboundISGOrderService = new SKUOutboundISGOrderService(
    new BESKUInboundService(),
    new BESKUOutboundISGOrderService(),
    new BackendlessService(),
)

const sendOut = async(event) => {
    try {
        console.log({
            message: "Incoming request",
            data: JSON.parse(event.body),
        });
        

        console.log(event.pathParameters.sku_outbound_isgorder_id)


        const body = JSON.parse(event.body);

        await skuOutboundISGOrderService.sendOut(
            event.pathParameters.sku_outbound_isgorder_id,
            body.status,
            body.warehouse,
        )
        
        let res = {
            statusCode: 200,
            body: JSON.stringify(body),
          };
      
          console.log({
            message: "Outgoing response",
            data: res,
          });

        return res;
    } catch(err) {
        console.log(err);

        if(err.message == "sku_inbound_notfound") {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "No SKU_Inbound that links to this ID found",
                }),
            };
        }

        if(err.message == "Insufficient") {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Insufficient items in SKU_Inbound",
                }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "INTERNAL_SERVER_ERROR",
            }),
        };
    }
}

module.exports = {
    sendOut,
}
