"use strict";

const axios = require("axios");
const assert = require("assert");

const BESKUOutboundService = require('./skuoutbound').BESKUOutboundService;
const BESKUInboundService = require('./skuinbound').BESKUInboundService;
const BESKUOutboundISGOrderService = require('./skuoutboundisgorders').BESKUOutboundISGOrderService;

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
              "Content-Type": "application/json",
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

    async updateAll(tableName, id, data) {
        assert(typeof(tableName) === "string");
        assert(typeof(id) === "string");
        assert(typeof(data) === "object");

        const requestPayload = {
            method: "POST",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/transaction/unit-of-work`,
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                'isolationLevelEnum': 'READ_UNCOMMITTED',
                'operations': [
                    {
                        'operationType': 'FIND',
                        'table': tableName,
                        "opResultId": "FIND-" + id,
                        "payload": {
                            "pageSize" : 1,
                            "whereClause":`objectId = '${id}'`
                        }
                    }, {
                        'operationType': 'UPDATE_BULK',
                        'table': tableName,
                        "opResultId": "UPDATE_BULK-" + id,
                        'payload': {
                            "unconditional" : {
                                "___ref": true,
                                "opResultId": "FIND-" + id,
                            }, 
                            "changes" : data,
                        }
                    }
                ],
            },
        };

        const res = await axios(requestPayload);
        return res.data;
    }

    async addRelation(parentTable, relationTable, relationName, id, where) {
        assert(typeof(parentTable) === "string");
        assert(typeof(relationTable) === "string");
        assert(typeof(relationName) === "string");
        assert(typeof(id) === "string");
        assert(typeof(where) === "string");

        const requestPayload = {
            method: "POST",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/transaction/unit-of-work`,
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                'isolationLevelEnum': 'READ_UNCOMMITTED',
                'operations': [
                    {
                        'operationType': 'FIND',
                        'table': parentTable,
                        "opResultId": `FIND-${parentTable}-${id}`,
                        "payload": {
                            "pageSize" : 1,
                            "whereClause":`objectId = '${id}'`
                        }
                    }, {
                        'operationType': 'FIND',
                        'table': relationTable,
                        "opResultId": `FIND-${relationTable}`,
                        "payload": {
                            "whereClause": where
                        }
                    }, {
                        'operationType': 'SET_RELATION',
                        'table': parentTable,
                        "opResultId": `SET_RELATION-${relationTable}-${id}`,
                        'payload': {
                            "parentObject": {
                                "___ref": true,
                                "opResultId": `FIND-${parentTable}-${id}`,
                                "resultIndex" : 0,
                                "propName" : "objectId"
                            },
                            "relationColumn": relationName,
                            "unconditional" : {
                                "___ref": true,
                                "opResultId": `FIND-${relationTable}`,
                            }, 
                        }
                    }
                ],
            },
        };

        const res = await axios(requestPayload);
        return res.data;
    }
}



module.exports = {
    BackendlessService,
    BESKUOutboundService,
    BESKUInboundService,
    BESKUOutboundISGOrderService,
}
