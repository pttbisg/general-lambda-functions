"use strict";

const assert = require("assert");

const DEFAULT_INBOUND_CURRENT_LOCATION = "";
const DEFAULT_OUTBOUND_REASON = "";
const DEFAULT_OUTBOUND_ISGORDER_STORE_NAME = "";

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

        const inbounds = await createInboundResponsePayload(
            createInboundInventoryDetails(skuInbounds),
        );

        sku['inventory_details']['inbounds'] = inbounds;

        const sales = await createOutboundISGOrderResponsePayload(
            createOutboundISGOrderInventoryDetails(skuOutboundISGOrders)
        );

        sku['inventory_details']['sales'] =  sales;

        const otherUse = await createOutboundResponsePayload(
            createOutboundInventoryDetails(skuOutbounds)
        );
        
        sku['inventory_details']['other_use'] = otherUse;

        sku['balance_stock_left'] = await calculateBalanceStockLeft(inbounds, sales, otherUse);

        responsePayload.push(sku);
    }

    return responsePayload;

    } catch(err) {
        throw err;
    }
}

function createInboundInventoryDetails(inbounds) {
    assert(typeof(inbounds) === "object");

    let result = {}

    for (let i = 0; i < inbounds.length; i++) {
        let currentLocation = inbounds[i].CurrentLocation;

        let date = convertEpochToDate(inbounds[i].Actual_Received_Date);

        let qty = inbounds[i].Qty_new_received;

        if (currentLocation == null) {
            currentLocation = DEFAULT_INBOUND_CURRENT_LOCATION;
        }

        if(result.hasOwnProperty(currentLocation) == false) {
            result[currentLocation] = {};
        }

        if (result[currentLocation][date] == undefined) {
            result[currentLocation][date] = 0;
        }

        if (qty == null) {
            qty = 0;
        }

        result[currentLocation][date] += parseInt(qty);
    }

    return result
}

function createInboundResponsePayload(resInbounds) {
    assert(typeof(resInbounds) === "object");

    let result = [];

    const listKey = Object.keys(resInbounds);

    for(let i = 0; i < listKey.length; i++) {
        const listDate = Object.keys(resInbounds[listKey[i]]);

        for(let j = 0; j < listDate.length; j++) {
            result.push({
                'date': listDate[j],
                'current_location': listKey[i],
                'qty': resInbounds[listKey[i]][listDate[j]],
            });
        }
    }

    return result
}

function createOutboundInventoryDetails(outbounds) {
    assert(typeof(outbounds) === "object");

    let result = {}

    for (let i = 0; i < outbounds.length; i++) {
        let reason = outbounds[i].Reason;

        let qty = outbounds[i].Qty;

        if (reason == null) {
            reason = DEFAULT_OUTBOUND_REASON;
        }

        if(result.hasOwnProperty(reason) == false) {
            result[reason] = 0;
        }

        if (qty == null) {
            qty = 0;
        }

        result[reason] += parseInt(qty);
    }

    return result
}

function createOutboundResponsePayload(resOutbounds) {
    assert(typeof(resOutbounds) === "object");

    let result = [];

    const listKey = Object.keys(resOutbounds);

    for(let i = 0; i < listKey.length; i++) {
        result.push({
        'reason': listKey[i],
        'qty': resOutbounds[listKey[i]],
        });
    }

    return result;
}

function createOutboundISGOrderInventoryDetails(outbounds) {
    assert(typeof(outbounds) === "object");

    let result = {}

    for (let i = 0; i < outbounds.length; i++) {
        let storeName = outbounds[i].Store_Name;

        let qty = outbounds[i].LineitemQty;

        if (storeName == null) {
            storeName = DEFAULT_OUTBOUND_ISGORDER_STORE_NAME;
        }

        if(result.hasOwnProperty(storeName) == false) {
            result[storeName] = 0;
        }

        if (qty == null) {
            qty = 0;
        }

        result[storeName] += parseInt(qty);
    }

    return result
}

function createOutboundISGOrderResponsePayload(resOutbounds) {
    assert(typeof(resOutbounds) === "object");

    let result = [];

    const listKey = Object.keys(resOutbounds);

    for(let i = 0; i < listKey.length; i++) {
        result.push({
        'storename': listKey[i],
        'qty': resOutbounds[listKey[i]],
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
