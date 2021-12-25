'use strict';

const AIRTABLE = {
    API_KEY: process.env.AIRTABLE_API_KEY || "",
    PTTBOutbound: {
        ID: "appuFoWSGUWJ9yMyq",
        TABLE: {
            MainShopifyOrders: "Main Shopify Orders (PTTB)",
            ISGOrderSource: "ISGOrderSource",
            TestAirtableBackendless: "test_airtable_backendless",
        }
    },
    ShopifyUrbanFox: {
        ID: "appfmhpqL53IXwBzk",
        TABLE: {
            AscmSKUs: "ASCM_SKUs",
            ShopeeOrders: "Shopee Orders",
            ShopifyOrders: "New ISG Orders Table", // not found
            LazadaOrders: "Lazada Orders",
            SKULocal: "SKU_localSKU", // not found
            SKUMatching: "MasterSKU%20(Synced)", // not found
        }

    },
    DEFAULT_DELAYER_MS: 200,
    DEFAULT_MAX_RECORD: 1,
};

module.exports = {
    AIRTABLE,
}
