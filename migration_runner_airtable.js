"use strict";

const axios = require("axios");
const _ = require('lodash');

const url = "https://q3wfs0nbrg.execute-api.ap-southeast-1.amazonaws.com/dev";
// const url = "http://localhost:3000";

(async () => {
    try {
        console.log("Ping Aurora Serverless...")
        await startUpAuroraServerless();

        let finishMigratingASCMSKUs = false;

        console.log("Migration: ascm_skus - START");
        while(finishMigratingASCMSKUs == false) {
            let res = await axios({
                method: "post",
                url: `${url}/airtable/migrate/outbounds_ascm_skus`
            })

            console.log(res.data)

            console.log(`outbounds_ascm_skus - total: ${_.get(res, "data.result", []).length || _.get(res, "result.records", []).length == 0}`)

            if(_.get(res, "data.total") == 0 || _.get(res, "data.total") == undefined) {
                finishMigratingASCMSKUs = true;
                console.log("Migration: sku_matching - DONE");
            }
        }

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
