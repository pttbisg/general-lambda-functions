'use strict';

const axios = require('axios');
const axiosRetry = require('axios-retry');
const _ = require('lodash');

axiosRetry(axios, {
    retries: 100,
    retryDelay: axiosRetry.exponentialDelay,
});

const { AIRTABLE } = require("./enum");

class AirtablePTTBOutboundMainShopifyOrdersService{
    constructor() {
        this.baseID = AIRTABLE.PTTBOutbound.ID;
        this.tableName = AIRTABLE.PTTBOutbound.TABLE.MainShopifyOrders;
    }

    async MigrateISGOrderSourceToASCMLogistics() {
        const isgOrders = await this.getISGOrderSourceFilterBySendToASCM(false);
        // console.log(isgOrders);
        
        const groupedISGOrders = this.groupISGOrderByName(isgOrders.records);
        // console.log(groupedISGOrders);

        const convertedGroupedISGOrders = []
        for(let groupedISGOrder of groupedISGOrders) {
            groupedISGOrder = this.convertISGOrderToASCMLogisticsAirtable(groupedISGOrder);
            convertedGroupedISGOrders.push(groupedISGOrder);
        }
        // console.log(convertedGroupedISGOrders);

        let convertedGroupedISGOrderGroupOf10 = []
        for(let i = 0; i < convertedGroupedISGOrders.length; i++) {
            convertedGroupedISGOrderGroupOf10.push(convertedGroupedISGOrders[i]);

            if(convertedGroupedISGOrderGroupOf10.length == 10 || i == convertedGroupedISGOrders.length - 1) {
                const ascmLogistics = await this.insertToASCMLogictics(convertedGroupedISGOrderGroupOf10);
                // console.log(ascmLogistics.records);

                convertedGroupedISGOrderGroupOf10 = [];
            }
        }

        let total = 0;
        let data = [];

        let isgOrdersGroupOf10 = [];
        for(let i = 0; i < isgOrders.records.length; i++) {
            isgOrdersGroupOf10.push(isgOrders.records[i]);

            if(isgOrdersGroupOf10.length == 10 || i == isgOrders.length - 1) {
                const result = await this.patchISGOrderSourceMarkSendToASCM(isgOrdersGroupOf10);

                total += isgOrdersGroupOf10.length;
                data = data.concat(result.records);

                isgOrdersGroupOf10 = [];
            }
        }

        return {
            total: total,
            data: data,
        };
    }

    async getISGOrderSourceFilterBySendToASCM(SendToASCM) {
        let checked = 0;;
        if(SendToASCM == true) {
            checked = 1;
        }

        const payload = {
            method: "GET",
            url:`https://api.airtable.com/v0/${AIRTABLE.PTTBOutbound.ID}/${encodeURIComponent(AIRTABLE.PTTBOutbound.TABLE.ISGOrderSource)}?&filterByFormula=AND({SendToASCM} = ${checked})&sort%5B0%5D%5Bfield%5D=Name&sort%5B0%5D%5Bdirection%5D=asc`,
            headers: {
                Authorization: `Bearer ${AIRTABLE.API_KEY}`,
            },
        };

        const res = await axios(payload);

        return res.data;
    }

    groupISGOrderByName(isgOrders) {
        let groupedISGOrder = {};

        for(let isgOrder of isgOrders) {
            isgOrder = isgOrder.fields;

            if(groupedISGOrder[isgOrder['Name']] == undefined) {
                groupedISGOrder[isgOrder['Name']] = {
                    "Name": isgOrder['Name'],
                    "LineItem": 0,
                    "UFTracking": isgOrder['UFTracking'],
                    "ASCM_ID": isgOrder['ASCM_ID'],
                }
            }

            groupedISGOrder[isgOrder['Name']]['LineItem'] += 1;
        }

        const names = Object.keys(groupedISGOrder);

        let result = [];
        for(const name of names) {
            result.push(groupedISGOrder[name]);
        }

        return result;
    }

    convertISGOrderToASCMLogisticsAirtable(isgOrder) {
        const data = {
            deliveryOrder: _.get(isgOrder, "Name", "").substring(0, 20),
            deliveryOrderLineNumber: _.get(isgOrder, "LineItem", 0) > 9999 ? 9999 : _.get(isgOrder, "LineItem", 0),
            referenceNumber: _.get(isgOrder, "UFTracking", "").substring(0, 20),
            customerID: "ISG01",
            productID: _.get(isgOrder, "ASCM_ID", "").substring(0, 13),
        }

        return {
            "fields": {
                "Delivery Order Number\n(Max 20 Chars)\n*COMPULSORY FIELD": data.deliveryOrder,
                "Delivery Order Line Number\n(Max 4 digits)\n*COMPULSORY FIELD":data.deliveryOrderLineNumber,
                "Reference Number \n(Max 20 Chars)":  data.referenceNumber,
                "Product ID (Max 13 Chars for 50x25mm Labels)":  data.productID,
                "Customer ID\n(Max 20 Chars)\n*COMPULSORY FIELD":data.customerID,
            },
        }
    }

    async insertToASCMLogictics(data) {
        const payload = {
            method: "POST",
            url:`https://api.airtable.com/v0/${AIRTABLE.PTTBOutbound.ID}/${encodeURIComponent(AIRTABLE.PTTBOutbound.TABLE.ASCMLogistics)}`,
            headers: {
                Authorization: `Bearer ${AIRTABLE.API_KEY}`,
                "Content-Type": "application/json",
            },
            data: {
                typecast: true,
                records: data
            }
        };

        const res = await axios(payload);

        return res.data;
    };

    async patchISGOrderSourceMarkSendToASCM(isgOrders) {
        const markedISGOrders = isgOrders.map(isgOrder => {
            isgOrder.fields = {
                'SendToASCM': true,
            };

            delete isgOrder.createdTime;

            return isgOrder;
        });

        const payload = {
            method: "PATCH",
            url:`https://api.airtable.com/v0/${AIRTABLE.PTTBOutbound.ID}/${encodeURIComponent(AIRTABLE.PTTBOutbound.TABLE.ISGOrderSource)}`,
            headers: {
                Authorization: `Bearer ${AIRTABLE.API_KEY}`,
                "Content-Type": "application/json",
            },
            data: {
                records: markedISGOrders
            }
        };

        const res = await axios(payload);

        return res.data;
    };
}

module.exports = {
    AirtablePTTBOutboundMainShopifyOrdersService,
}
