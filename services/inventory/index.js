"use strict";

const axios = require('axios');
const _ = require ("lodash");
const assert = require("assert");

const {
    BackendlessService,
} = require('../backendless');

const {
    shard,
} = require('./calculation');

class InventoryService {
    constructor(backendlessService) {
        this.backendlessService = backendlessService;
    };

    async getInventoryByUserID(userObjectID) {
        try {
            assert(typeof(userObjectID) === "string")
    
            let result = [];
    
            let skuMatchings = await this.backendlessService.retrieveAllSKUMatchingByUserOID(userObjectID);
    
            const [
                skuInbounds, 
                skuOutboundISGOrders, 
                skuOutbounds
            ] = await Promise.all([
                this.backendlessService.retrieveAllSKUInboundBySKUMatchingOID(userObjectID),
                this.backendlessService.retrieveAllSKUOutboundISGOrdersBySKUMatchingOID(userObjectID),
                this.backendlessService.retrieveAllSKUOutboundBySKUMatchingOID(userObjectID),
            ]);
    
            let chunks = _.chunk(skuMatchings, 1);
    
            await Promise.all(chunks.map(async function(element) {
                let reply = await shard(
                    element,
                    skuInbounds.filter(e => e.LINK_SKUMatching.objectId==element[0].objectId),
                    skuOutboundISGOrders.filter(e => e.LINK_SKUMatching.objectId==element[0].objectId),
                    skuOutbounds.filter(e => e.LINK_SKUMatching.objectId==element[0].objectId)
                );
    
                result.push(reply[0]);
            }));
    
            return result;
    
        } catch(err) {
            throw err;
        }
    }
};



module.exports = {
    InventoryService,
}
