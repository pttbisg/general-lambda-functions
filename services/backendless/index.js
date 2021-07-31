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
        assert(typeof(pageSize) === "number")
      
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
    
    async retrieveAllSKUInboundBySKUMatchingOID(objectID) {
        let offset = BACKENDLESS.DEFAULT.OFFSET;
        let length = BACKENDLESS.DEFAULT.PAGESIZE;
      
        let result = [];
      
        while (length >= BACKENDLESS.DEFAULT.PAGESIZE) {
          let skuInbounds = await this.retrieveSKUInboundBySKUMatchingOID(objectID, BACKENDLESS.DEFAULT.PAGESIZE, offset);
    
          length = skuInbounds.length;
    
          result = result.concat(skuInbounds);
    
          offset += BACKENDLESS.DEFAULT.PAGESIZE;
        }
      
        return result;
      }
    
    async retrieveSKUInboundBySKUMatchingOID(objectID, pageSize, offset) {
        assert(typeof(objectID) === "string")
        assert(typeof(pageSize) === "number")
        assert(typeof(pageSize) === "number")
        
        const requestPayload = {
            method: "GET",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKUInbound}?where=LINK_SKUMatching.allowedUsers = '${objectID}'&loadRelations=LINK_SKUMatching&pageSize=${pageSize}&offset=${offset}`,
            headers: {
                "Content-Type": "application/json"
            },
        };
    
        const res = await axios(requestPayload);
        return res.data;
    }
    
    async retrieveAllSKUOutboundISGOrdersBySKUMatchingOID(objectID) {
        let offset = BACKENDLESS.DEFAULT.OFFSET;
        let length = BACKENDLESS.DEFAULT.PAGESIZE;
      
        let result = [];
      
        while (length >= BACKENDLESS.DEFAULT.PAGESIZE) {
          let skuOutboundISGOrders = await this.retrieveSKUOutboundISGOrdersBySKUMatchingOID(objectID, BACKENDLESS.DEFAULT.PAGESIZE, offset);
    
          length = skuOutboundISGOrders.length;
    
          result = result.concat(skuOutboundISGOrders);
    
          offset += BACKENDLESS.DEFAULT.PAGESIZE;
        }
        
        return result;
    }
      
    async retrieveSKUOutboundISGOrdersBySKUMatchingOID(objectID, pageSize, offset) {
        assert(typeof(objectID) === "string")
        assert(typeof(pageSize) === "number")
        assert(typeof(pageSize) === "number")
    
        const requestPayload = {
            method: "GET",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKUOutboundISGOrders}?where=LINK_SKUMatching.allowedUsers = '${objectID}'&loadRelations=LINK_SKUMatching&pageSize=${pageSize}&offset=${offset}`,
            headers: {
            "Content-Type": "application/json"
            },
        };
    
        const res = await axios(requestPayload);
    
        return res.data;
    }
    
    async retrieveAllSKUOutboundBySKUMatchingOID(objectID) {
        let offset = BACKENDLESS.DEFAULT.OFFSET;
        let length = BACKENDLESS.DEFAULT.PAGESIZE;
    
        let result = [];
    
        while (length >= BACKENDLESS.DEFAULT.PAGESIZE) {
            let skuOutbounds = await this.retrieveSKUOutboundBySKUMatchingOID(objectID, BACKENDLESS.DEFAULT.PAGESIZE, offset);
    
            length = skuOutbounds.length;
    
            result = result.concat(skuOutbounds);
    
            offset += BACKENDLESS.DEFAULT.PAGESIZE;
        }
    
        return result;
    }
    
    async retrieveSKUOutboundBySKUMatchingOID(objectID, pageSize, offset) {
        assert(typeof(objectID) === "string")
        assert(typeof(pageSize) === "number")
        assert(typeof(pageSize) === "number")
    
        const requestPayload = {
            method: "GET",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKUOutbound}?where=LINK_SKUMatching.allowedUsers = '${objectID}'&loadRelations=LINK_SKUMatching&pageSize=${pageSize}&offset=${offset}`,
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
