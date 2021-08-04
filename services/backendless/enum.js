"use strict";

const BACKENDLESS = {
    APP_ID_PROD: process.env.BACKENDLESS_APP_ID_PROD || "",
    APP_KEY_PROD: process.env.BACKENDLESS_APP_KEY_PROD || "",
    DEFAULT: {
        OFFSET: 0,
        PAGESIZE: 100,
    },
    TABLE: {
        SKUMatching: "SKU_matching",
        SKUInbound: "SKU_Inbound",
        SKUOutbound: "SKU_Outbound",
        SKUOutboundISGOrders: "SKU_Outbound_ISGOrders",
    },
}

module.exports = {
    BACKENDLESS,
}
