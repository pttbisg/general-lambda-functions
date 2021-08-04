"use strict";

const axios = require("axios");
const assert = require("assert");

const { BACKENDLESS } = require('./enum');

class BackendlessService {
    async retrieveAllSKUMatchingByUserOID(objectID) {
        assert(typeof(objectID) === "string")
        
        let offset = BACKENDLESS.DEFAULT.OFFSET;
        let length = BACKENDLESS.DEFAULT.PAGESIZE;
      
        let result = [];
      
        while (length >= BACKENDLESS.DEFAULT.PAGESIZE) {
            let skuMatchings = await this.retrieveSKUMatchingByUserOID(objectID, BACKENDLESS.DEFAULT.PAGESIZE, offset);
      
            length = skuMatchings.length;
      
            result = result.concat(skuMatchings);
      
            offset += BACKENDLESS.DEFAULT.PAGESIZE;
        }
        
        return result;
    }
      
    async retrieveSKUMatchingByUserOID(objectID, pageSize, offset) {
        assert(typeof(objectID) === "string")
        assert(typeof(pageSize) === "number")
        assert(typeof(offset) === "number")
      
        const requestPayload = {
            method: "GET",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKUMatching}?where=allowedUsers = '${objectID}'&pageSize=${pageSize}&offset=${offset}`,
            headers: {
              "Content-Type": "application/json"
            },
        };
    
      const res = await axios(requestPayload);
    
      return res.data;
    }

    async calculateSKUInboundQty(skuMatchingAllowedUser) {
        let offset = BACKENDLESS.DEFAULT.OFFSET;
        let length = BACKENDLESS.DEFAULT.PAGESIZE;
        let result = [];

        const groupBy = "LINK_SKUMatching.objectId , CurrentLocation, Actual_Received_Date"
        const props = "LINK_SKUMatching.objectId , CurrentLocation, Actual_Received_Date, Sum(Qty_new_received)"
        const where = `LINK_SKUMatching.allowedUsers = '${skuMatchingAllowedUser}'` 

        while (length >= BACKENDLESS.DEFAULT.PAGESIZE) {
            let skuInbounds = await this.aggregateTable(
                BACKENDLESS.TABLE.SKUInbound,
                groupBy, 
                props,
                where,
                BACKENDLESS.DEFAULT.PAGESIZE, 
                offset,
            );
      
            length = skuInbounds.length;
      
            result = result.concat(skuInbounds);
      
            offset += BACKENDLESS.DEFAULT.PAGESIZE;
        }
      
        return result;
    }

    async calculateSKUOutboundQty(skuMatchingAllowedUser) {
      let offset = BACKENDLESS.DEFAULT.OFFSET;
      let length = BACKENDLESS.DEFAULT.PAGESIZE;
      let result = [];

      const groupBy = "LINK_SKUMatching.objectId , Reason"
      const props = "LINK_SKUMatching.objectId , Reason, Sum(Qty)"
      const where = `LINK_SKUMatching.allowedUsers = '${skuMatchingAllowedUser}'` 

      while (length >= BACKENDLESS.DEFAULT.PAGESIZE) {
          let skuInbounds = await this.aggregateTable(
            BACKENDLESS.TABLE.SKUOutbound,
            groupBy, 
            props,
            where,
            BACKENDLESS.DEFAULT.PAGESIZE, 
            offset,
          );
    
          length = skuInbounds.length;
    
          result = result.concat(skuInbounds);
    
          offset += BACKENDLESS.DEFAULT.PAGESIZE;
      }
    
      return result;
    }

    async calculateSKUOutboundISGOrderQty(skuMatchingAllowedUser) {
        let offset = BACKENDLESS.DEFAULT.OFFSET;
        let length = BACKENDLESS.DEFAULT.PAGESIZE;
        let result = [];

        const groupBy = "LINK_SKUMatching.objectId , Store_Name"
        const props = "LINK_SKUMatching.objectId, Store_Name, Sum(LineitemQty)"
        const where = `LINK_SKUMatching.allowedUsers = '${skuMatchingAllowedUser}'` 

        while (length >= BACKENDLESS.DEFAULT.PAGESIZE) {
            let skuInbounds = await this.aggregateTable(
                BACKENDLESS.TABLE.SKUOutboundISGOrders,
                groupBy, 
                props,
                where,
                BACKENDLESS.DEFAULT.PAGESIZE, 
                offset,
            );
        
            length = skuInbounds.length;
        
            result = result.concat(skuInbounds);
        
            offset += BACKENDLESS.DEFAULT.PAGESIZE;
        }
        
        return result;
    }

    async aggregateTable(tableName, groupBy, props, where, pageSize, offset) {
        assert(typeof(tableName) === "string")
        assert(typeof(groupBy) === "string")
        assert(typeof(props) === "string")
        assert(typeof(where) === "string")
        assert(typeof(pageSize) === "number")
        assert(typeof(offset) === "number")

        const requestPayload = {
            method: "GET",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${tableName}?groupBy=${groupBy}&props=${props}&where=${where}&pageSize=${pageSize}&offset=${offset}`,
            headers: {
                "Content-Type": "application/json"
            },
        };

        const res = await axios(requestPayload);
        return res.data;
    }
}



module.exports = {
    BackendlessService,
}
