"use strict";

const axios = require("axios");
const axiosRetry = require("axios-retry");
const _ = require("lodash");

axiosRetry(axios, {
  retries: 100,
  retryDelay: axiosRetry.exponentialDelay,
});

const { AIRTABLE } = require("./enum");

class AirtableOutboundShopeeOrdersService {
    async getUnmigratedRows() {
        const requestPayload = {
            method: "GET",
            url: `https://api.airtable.com/v0/${AIRTABLE.ShopifyUrbanFox.ID}/${AIRTABLE.ShopifyUrbanFox.TABLE.ShopeeOrders}?filterByFormula=AND({is_migrated_to_aurora}=0)&maxRecords=${AIRTABLE.DEFAULT_MAX_RECORD}`,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${AIRTABLE.API_KEY}`
            },
        };

        const res = await axios(requestPayload);

        return res.data;
    }

    async getByID(id) {
      const requestPayload = {
          method: "GET",
          url: `https://api.airtable.com/v0/${AIRTABLE.ShopifyUrbanFox.ID}/${AIRTABLE.ShopifyUrbanFox.TABLE.ShopeeOrders}/${id}`,
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
            url: `https://api.airtable.com/v0/${AIRTABLE.ShopifyUrbanFox.ID}/${AIRTABLE.ShopifyUrbanFox.TABLE.ShopeeOrders}`,
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
  AirtableOutboundShopeeOrdersService,
}
