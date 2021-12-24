"use strict";

const axios = require("axios");
const _ = require('lodash');

const url = "https://q3wfs0nbrg.execute-api.ap-southeast-1.amazonaws.com/dev";
// const url = "http://localhost:3000";

(async () => {
    try {
        console.log("Ping Aurora Serverless...")
        await startUpAuroraServerless();

        let finishMigratingSKUMatching = false;

        console.log("Migration: sku_matching - START");
        while(finishMigratingSKUMatching == false) {
            let res = await axios({
                method: "post",
                url: `${url}/backendless/migrate/sku_matching`
            })

            console.log(`sku_matching - total: ${_.get(res, "data.total")}`)

            if(_.get(res, "data.total") == 0) {
                finishMigratingSKUMatching = true;
                console.log("Migration: sku_matching - DONE");
            }
        }

        await Promise.all([
            // runMigratingHelpwiseConversations(),
            // runMigratingOutboundsAscmSkus(),
            // runMigratingPTTBOutboundsShopeeOrders(),
            runMigratingPTTBOutboundsShopifyOrders(),
        ])

    } catch(err) {
        console.log(err);
        throw err;
    }
})();

async function startUpAuroraServerless() {
    return await axios({
        method: "get",
        url: `${url}/be_to_aurora_serverless/ping`
    })
}

async function runMigratingOutboundsAscmSkus() {
    try {
        let finishMigrating = false;

        console.log("Migration: outbounds_ascm_skus - START");
        while(finishMigrating == false) {
            let res = await axios({
                method: "post",
                url: `${url}/backendless/migrate/outbounds_ascm_skus`
            })

            console.log(`outbounds_ascm_skus - total: ${_.get(res, "data.total")}`)

            if(_.get(res, "data.total") == 0) {
                finishMigrating = true;
                console.log("Migration: outbounds_ascm_skus - DONE");
            }
        }
    } catch(err) {
        console.log(err);
        throw err;
    }
};

async function runMigratingHelpwiseConversations() {
    try {
        let finishMigrating = false;

        console.log("Migration: helpwise_conversations - START");
        while(finishMigrating == false) {
            let res = await axios({
                method: "post",
                url: `${url}/backendless/migrate/helpwise_conversations`
            })

            console.log(`helpwise_conversations - total: ${_.get(res, "data.total")}`)

            if(_.get(res, "data.total") == 0) {
                finishMigrating = true;
                console.log("Migration: helpwise_conversations - DONE");
            }
        }
    } catch(err) {
        console.log(err);
        throw err;
    }
};

async function runMigratingPTTBOutboundsShopeeOrders() {
    try {
        let finishMigrating = false;

        console.log("Migration: pttb_outbounds_shopee_orders - START");
        while(finishMigrating == false) {
            let res = await axios({
                method: "post",
                url: `${url}/backendless/migrate/pttb_outbounds_shopee_orders`
            })

            console.log(`pttb_outbounds_shopee_orders - total: ${_.get(res, "data.total")}`)

            if(_.get(res, "data.total") == 0) {
                finishMigrating = true;
                console.log("Migration: pttb_outbounds_shopee_orders - DONE");
            }
        }
    } catch(err) {
        console.log(err);
        throw err;
    }
};

async function runMigratingPTTBOutboundsShopifyOrders() {
    try {
        let finishMigrating = false;

        console.log("Migration: pttb_outbounds_shopify_orders - START");
        while(finishMigrating == false) {
            let res = await axios({
                method: "post",
                url: `${url}/backendless/migrate/pttb_outbounds_shopify_orders`
            })

            console.log(`pttb_outbounds_shopify_orders - total: ${_.get(res, "data.total")}`)

            if(_.get(res, "data.total") == 0) {
                finishMigrating = true;
                console.log("Migration: pttb_outbounds_shopify_orders - DONE");
            }
        }
    } catch(err) {
        console.log(err);
        throw err;
    }
}
