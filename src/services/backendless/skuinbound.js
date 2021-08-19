"use strict";

const axios = require("axios");
const assert = require("assert");

const { BACKENDLESS } = require('./enum');

class BESKUInboundService {
    async getAllByQuery(where, pageSize, offset, orderBy) {
        const requestPayload = {
            method: "GET",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKUInbound}?where=${where}&pageSize=${pageSize}&offset=${offset}&orderBy=${orderBy}`,
            headers: {
              "Content-Type": "application/json"
            },
        };
    
        const res = await axios(requestPayload);
        
        return res.data;
    }

    async updateOneByID(id, body) {
        assert(typeof(id) === "string");

        const requestPayload = {
            method: "PUT",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKUInbound}/${id}`,
            headers: {
              "Content-Type": "application/json"
            },
            body: body,
        };
    
        const res = await axios(requestPayload);
        
        return res.data;
    }

    async getAllForSendOut(skuMatchingID, warehouse) {
        assert(typeof(skuMatchingID) === "string");
        assert(typeof(warehouse) === "string");
    
        const where = `LINK_SKUMatching.objectId = '${skuMatchingID}' AND CurrentLocation = '${warehouse}' AND (Qty_new_left != 0 OR Qty_new_received > 0)`
        const orderBy = "created ASC, objectId ASC";
    
        let offset = BACKENDLESS.DEFAULT.OFFSET;
        let length = BACKENDLESS.DEFAULT.PAGESIZE;
        
        let result = [];
    
        while(length >= BACKENDLESS.DEFAULT.PAGESIZE) {
            let skuInbounds = await this.getAllByQuery(
                where,
                BACKENDLESS.DEFAULT.PAGESIZE,
                offset,
                orderBy,
            )
    
            length = skuInbounds.length;
          
            result = result.concat(skuInbounds);
        
            offset += BACKENDLESS.DEFAULT.PAGESIZE;
        }
    
        return result;
    }
}

module.exports = {
    BESKUInboundService,
}
