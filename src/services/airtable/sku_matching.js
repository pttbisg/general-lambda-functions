"use strict";

const axios = require("axios");
const axiosRetry = require("axios-retry");
const _ = require("lodash");

axiosRetry(axios, {
  retries: 100,
  retryDelay: axiosRetry.exponentialDelay,
});

const { AIRTABLE } = require("./enum");

class AirtableSKUMatchingService {
    async getByID(id) {
        const requestPayload = {
            method: "GET",
            url: `https://api.airtable.com/v0/${AIRTABLE.ShopifyUrbanFox.ID}/${AIRTABLE.ShopifyUrbanFox.TABLE.SKUMatching}/${id}`,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${AIRTABLE.API_KEY}`
            },
        };

        const res = await axios(requestPayload);

        return res.data;
    }

    async getUnmigratedRows() {
        const requestPayload = {
            method: "GET",
            url: `https://api.airtable.com/v0/${AIRTABLE.ShopifyUrbanFox.ID}/${AIRTABLE.ShopifyUrbanFox.TABLE.AscmSKUs}?filterByFormula=AND({is_migrated_to_aurora}=0)&maxRecords=${AIRTABLE.DEFAULT_MAX_RECORD}`,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${AIRTABLE.API_KEY}`
            },
        };

        const res = await axios(requestPayload);

        return res.data;
    }

    async patch(data) {
        const requestPayload = {
            method: "PATCH",
            url: `https://api.airtable.com/v0/${AIRTABLE.ShopifyUrbanFox.ID}/${AIRTABLE.ShopifyUrbanFox.TABLE.AscmSKUs}`,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${AIRTABLE.API_KEY}`
            },
            data,
        };

        const res = await axios(requestPayload);

        return res.data;
    }
}

module.exports = {
    AirtableSKUMatchingService,
}
