"use strict";

const axios = require("axios");

const { BACKENDLESS } = require('./enum');

class LocalSKUService {
    async getUnmigratedRows() {
        const requestPayload = {
            method: "GET",
            url: `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKULocal}?where=is_migrated_to_aurora = false&loadRelations=LINK_SKUMatching&pageSize=10`,
            headers: {
              "Content-Type": "application/json"
            },
        };

        const res = await axios(requestPayload);

        return res.data;
    }

    async put(id, data) {
        const res = await axios.put(
            `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.SKULocal}/${id}`,
            data,
        )

        return res.data;
    }
}

module.exports = {
    LocalSKUService,
}
