"use strict";

const assert = require("assert");
const _ = require('lodash')

async function shard(
    skuMatchings,
    skuInbounds,
    skuOutboundISGOrders,
    skuOutbounds,
){
    try {
        assert(typeof(skuMatchings) === "object");
        assert(typeof(skuInbounds) === "object");
        assert(typeof(skuOutboundISGOrders) === "object");
        assert(typeof(skuOutbounds) === "object");

        let responsePayload = [];

        for(let i = 0; i < skuMatchings.length; i++) {
            let sku = {
                "masterSKU": skuMatchings[i].masterSKU,
                "inventory_details": {
                "inbounds": [],
                "sales": [],
                "other_use": [],
                },
                "balance_stock_left": 0,
            }

            const inbounds = await createInboundResponsePayload(skuInbounds);

            sku['inventory_details']['inbounds'] = inbounds;

            const sales = await createOutboundISGOrderResponsePayload(skuOutboundISGOrders);

            sku['inventory_details']['sales'] =  sales;

            const otherUse = await createOutboundResponsePayload(skuOutbounds);
            
            sku['inventory_details']['other_use'] = otherUse;

            sku['balance_stock_left'] = await calculateBalanceStockLeft(inbounds, sales, otherUse);

            responsePayload.push(sku);
        }

        return responsePayload;

    } catch(err) {
        throw err;
    }
}

function createInboundResponsePayload(skuInbounds) {
    assert(typeof(skuInbounds) === "object");

    let result = [];

    for(let i = 0; i < skuInbounds.length; i++) {
        result.push({
            'date': convertEpochToDate(_.get(skuInbounds[i], "Actual_Received_Date")),
            'current_location': _.get(skuInbounds[i], "CurrentLocation"),
            'qty': _.get(skuInbounds[i], "sum"),
        });
    }

    return result
}

function createOutboundResponsePayload(skuOutbounds) {
    assert(typeof(skuOutbounds) === "object");

    let result = [];

    for(let i = 0; i < skuOutbounds.length; i++) {
        result.push({
            'reason': _.get(skuOutbounds[i], "Reason"),
            'qty': _.get(skuOutbounds[i], "sum"),
        });
    }

    return result;
}

function createOutboundISGOrderResponsePayload(skuOutboundISGOrders) {
    assert(typeof(skuOutboundISGOrders) === "object");

    let result = [];

    for(let i = 0; i < skuOutboundISGOrders.length; i++) {
        result.push({
            'storename': _.get(skuOutboundISGOrders[i], "Store_Name"),
            'qty': _.get(skuOutboundISGOrders[i], "sum"),
        });
    }

    return result;
}

function calculateBalanceStockLeft(inbounds, sales, otherUse) {
    assert(typeof(inbounds) === "object");
    assert(typeof(sales) === "object");
    assert(typeof(otherUse) === "object");
    
    let result = 0;

    for(let i = 0; i < inbounds.length; i++) {
        result += inbounds[i].qty;
    }

    for(let i = 0; i < sales.length; i++) {
        result -= sales[i].qty;
    }

    for(let i = 0; i < otherUse.length; i++) {
        result -= otherUse[i].qty;
    }

    return result;
}

function convertEpochToDate(epoch) {
    assert(typeof(epoch) === "number");

    return `${new Date(epoch).getDate()}-${new Date(epoch).getMonth()}-${new Date(epoch).getFullYear()}`;
}

module.exports = {
    shard,
}
