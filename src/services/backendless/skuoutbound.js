"use strict";

const axios = require("axios");
const assert = require("assert");

const { BACKENDLESS } = require('./enum');

class BESKUOutboundService {
    async findOneByID(id) {
        assert(typeof(id) === "string");

        const requestPayload = {
            method: "GET",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKUOutbound}/${id}?loadRelations=LINK_SKUMatching`,
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
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKUOutbound}/${id}`,
            headers: {
              "Content-Type": "application/json"
            },
            body: body,
        };
    
        const res = await axios(requestPayload);
        
        return res.data;
    }
}

module.exports = {
    BESKUOutboundService,
}
