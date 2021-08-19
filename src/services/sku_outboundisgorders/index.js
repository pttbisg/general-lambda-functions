"use strict";

const _ = require('lodash');

const { BACKENDLESS } = require('../backendless/enum');

class SKUOutboundISGOrderService {
    constructor(beSKUInboundService, beSKUOutboundISGOrderService, beService) {
        this.beSKUInboundService = beSKUInboundService;
        this.beSKUOutboundISGOrderService = beSKUOutboundISGOrderService;
        this.beService = beService;
    }

    async sendOut(skuOutboundISGOrderID, status, warehouse) {
        try {
            // Get SKU_OutboundISGOrder by ID
            let skuOutboundISGOrder = await this.beSKUOutboundISGOrderService.findOneByID(skuOutboundISGOrderID);
            // console.log(skuOutboundISGOrder);

            // GET SKU_Inbound by SKU_matching.objectId // CurrentLocation == warehousee // (Qty_new_left or Qty_new_received) > 0, sort by ascending date order
            if (
                _.get(skuOutboundISGOrder, "LINK_SKUMatching.objectId") == null ||
                _.get(skuOutboundISGOrder, "LINK_SKUMatching.objectId") == undefined
            ) {
                throw new Error("sku_inbound_notfound")
            }

            let skuInbounds = await this.beSKUInboundService.getAllForSendOut(
                _.get(skuOutboundISGOrder, "LINK_SKUMatching.objectId"),
                warehouse,
            )

            skuInbounds = this.updateOutdatedQtyFor(skuInbounds);
            // console.log(skuInbounds);


            // Update SKU_Inbound value by substracting its Qty_new_left with SKU_Outbound.Qty. If total Qty / LineitemQty > Qty_new_left / Qty_new_received, throw error insufficient. DO NOT do any update
            const payloads = this.createBEPayloadsToUpdateQtyToBeSentOut(skuOutboundISGOrder, skuInbounds, status);
            // console.log(payloads);

            // Run BE PATCH process
            for(let i = 0; i < payloads.length; i++) {
                let updatedRecord = await this.beService.updateAll(payloads[i].table, payloads[i].id, payloads[i].body);

                if (updatedRecord.success == false) {
                    throw updatedRecord.error;
                }
            }

            // Add relation
            const res = await this.beService.addRelation(
                BACKENDLESS.TABLE.SKUOutboundISGOrders, 
                BACKENDLESS.TABLE.SKUInbound, 
                "LINK_SKUInbound", 
                skuOutbound.objectId, 
                `objectId in (${this.getSkuInboundIDs(payloads)})`,
            );

            // console.log(res)

            return
        } catch(err) {
            throw err;
        }

    }

    updateOutdatedQtyFor(skuInbounds) {
        const res = skuInbounds.map((skuInbound) => {
            let qtyNewReceived = skuInbound.Qty_new_received;

            if(
                skuInbound.Qty_new_received === undefined ||
                skuInbound.Qty_new_received === null
            ) {
                qtyNewReceived = 0;
            }

            if (
                (
                    skuInbound.Qty_new_left === undefined ||
                    skuInbound.Qty_new_left === null
                ) && 
                qtyNewReceived > 0
            ) {
                skuInbound.Qty_new_left = qtyNewReceived;
            }

            return skuInbound
        })

        return res;
    }

    createBEPayloadsToUpdateQtyToBeSentOut(skuOutboundISGOrder, skuInbounds, status) {
        let payloads = [];

        let qtyLeft = skuOutboundISGOrder['LineitemQty'];
        // console.log("Initial: ", qtyLeft)

        let skuInboundStatusLOCRecords = [];
        let skuOutboundISGOrderStatusLOCRecords = [];

        if (skuOutboundISGOrder["STATUS_LOC_Records"] != null) {
            skuOutboundISGOrderStatusLOCRecords = JSON.parse(skuOutboundISGOrder["STATUS_LOC_Records"]);
        }

        for(let i = 0; i < skuInbounds.length; i++) {
            let payload = {
                "table": BACKENDLESS.TABLE.SKUInbound,
                "id": skuInbounds[i].objectId,
                "body": {},
            }

            let skuInboundMetadata = {
                "DateTime": new Date(),
                "sku_outboundisgorder_objectid": skuOutboundISGOrder.objectId,
            }

            if (skuInbounds[i]["STATUS_LOC_Records"] != null) {
                skuInboundStatusLOCRecords = JSON.parse(skuInbounds[i]["STATUS_LOC_Records"]);
            }

            let qtyInitial, qtyChange, qtyNewLeft;
            if(
                qtyLeft - skuInbounds[i]['Qty_new_left'] < 0
            ) {
                qtyInitial = skuInbounds[i]['Qty_new_left'];
                qtyChange = 0 - qtyLeft;
                qtyNewLeft = skuInbounds[i]['Qty_new_left'] - qtyLeft;

                _.merge(skuInboundMetadata, {
                    "Old_CurrentLocation": skuOutboundISGOrder.CurrentLocation,
                    "New_CurrentLocation": status,
                    "Qty_Initial": qtyInitial,
                    "Qty_Change": qtyChange,
                    "Qty_new_left": qtyNewLeft,
                })


                qtyLeft = 0;
                skuInbounds[i]['Qty_new_left'] = qtyNewLeft;

            } else {
                qtyInitial = skuInbounds[i]['Qty_new_left'];
                qtyChange = 0 - skuInbounds[i]['Qty_new_left'];
                qtyNewLeft = 0;

                _.merge(skuInboundMetadata, {
                    "Old_CurrentLocation": skuOutboundISGOrder.CurrentLocation,
                    "New_CurrentLocation": status,
                    "Qty_Initial": qtyInitial,
                    "Qty_Change": qtyChange,
                    "Qty_new_left": qtyNewLeft,
                })
                
                qtyLeft -= skuInbounds[i]['Qty_new_left'];
                skuInbounds[i]['Qty_new_left'] = 0;

            }
            // console.log("Inbound: ", skuInbounds[i]['Qty_new_left'])
            // console.log("Left: ", qtyLeft)
            skuInboundStatusLOCRecords.push(skuInboundMetadata)

            _.merge(payload.body, {
                "CurrentLocation": status,
                "Qty_new_left": qtyNewLeft,
                "STATUS_LOC_Records": JSON.stringify(skuInboundStatusLOCRecords)
            });

            payloads.push(payload);

            skuOutboundISGOrderStatusLOCRecords.push({
                "DateTime": new Date(),
                "sku_inbound_objectid": skuInbounds[i].objectId,
            }); 


            if (qtyLeft == 0) {
                break;
            }
        }

        if(qtyLeft > 0) {
            throw new Error("Insufficient")
        }

        payloads.push({
            "table": BACKENDLESS.TABLE.SKUOutboundISGOrders,
            "id": skuOutboundISGOrder.objectId,
            "body": {
                "Status": status,
                "STATUS_LOC_Records": JSON.stringify(skuOutboundISGOrderStatusLOCRecords),
            },
        })

        return payloads;
    }

    getSkuInboundIDs(payloads) {
        const ids = payloads.map((payload) => {
            if(payload.table === BACKENDLESS.TABLE.SKUInbound) {
                return payload.id;
            }
        })
        
        let res = '';
        ids.map((id) => {
            res += `'${id}',`
        })

        return res.slice(0, -1);
    }
}



module.exports = {
    SKUOutboundISGOrderService,
}
