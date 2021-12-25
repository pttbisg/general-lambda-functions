"use strict";

const axios = require("axios");
const axiosRetry = require("axios-retry");
const _ = require("lodash");

axiosRetry(axios, {
  retries: 100,
  retryDelay: axiosRetry.exponentialDelay,
});

const { AIRTABLE } = require("./enum");

class AirtableOutboundAscmSkusService {
    async getUnmigratedRows() {
        const requestPayload = {
            method: "GET",
            url: `https://api.airtable.com/v0/${AIRTABLE.ShopifyUrbanFox.ID}/${AIRTABLE.ShopifyUrbanFox.TABLE.AscmSKUs}?filterByFormula=AND({is_migrated_to_aurora}=0)&maxRecords=${AIRTABLE.DEFAULT_MAX_RECORD}`,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${AIRTABLE.API_KEY}`
            },
        };

        console.log("Get...")
        const res = await axios(requestPayload);
        console.log("Done")

        return res.data;
    } 

    async markAsMigrated(id) {
        const requestPayload = {
            method: "PATCH",
            url: `https://api.airtable.com/v0/${AIRTABLE.ShopifyUrbanFox.ID}/${AIRTABLE.ShopifyUrbanFox.TABLE.AscmSKUs}/${id}`,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${AIRTABLE.API_KEY}`
            },
            data: {
              fields: {
                "is_migrated_to_aurora": true
              }
            },
        };

        const res = await axios(requestPayload);

        return res.data;
    }
}

module.exports = {
    AirtableOutboundAscmSkusService,
}
