"use strict";

const { iteratee } = require('lodash');
const { expectation } = require('sinon');
const sinon = require('sinon');
const { InventoryService } = require('./index');
const { BackendlessService } = require('../backendless');

const backendlessService = new BackendlessService();

describe('BackendlessService.retrieveAllSKUMatchingByUserOID', () => {

    it('Should be able to retrieve inventory owned by user object ID', () => {
        sinon.stub(backendlessService, "retrieveAllSKUMatchingByUserOID").resolves([
            {
                masterSKU: 'master-sku',
                objectId: 'sku-matching-object-id'
            }
        ]);

        sinon.stub(backendlessService, "calculateSKUOutboundISGOrderQty").resolves([
            {
                "___class": "SKU_Outbound_ISGOrders",
                "Store_Name": 'store.name',
                "sum": 1,
                "objectId": 'sku-matching-object-id'
            },
        ]);

        sinon.stub(backendlessService, "calculateSKUOutboundQty").resolves([
            {
                "___class": "SKU_Outbound",
                "sum": 1,
                "Reason": "reason",
                "objectId": 'sku-matching-object-id'
            },
        ]);
        
        const inventoryService = new InventoryService(backendlessService);

        inventoryService.getInventoryByUserID('foo').then(res => {
            expect(res).toStrictEqual([{
                "balance_stock_left": -1, 
                "inventory_details": {
                    "inbounds": [{
                        "current_location": "current_location", 
                        "date": "15-6-2021", 
                        "qty": 1,
                    }], 
                    "other_use": [{"qty": 1, "reason": "reason"}], 
                    "sales": [{"qty": 1, "storename": "store.name"}]
                }, 
                "masterSKU": "master-sku",
            }]);
        }).catch(err => {
            expect(err).toBe(null);
        })
    });
});
