"use strict";

const { Pool } = require('pg');
const _ = require('lodash');
const AWS = require('aws-sdk')

const {
    AirtableOutboundAscmSkusService,
    AirtableSKUMatchingService,
    AirtableOutboundShopeeOrdersService,
    AirtableOutboundShopifyOrdersService,
} = require("./services/airtable");
const { AirtableLazadaOrdersService } = require('./services/airtable/lazada_orders');


const pool = new Pool({
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
    host: process.env.POSTGRES_HOST || '',
    port: process.env.POSTGRES_PORT || '',
    database: process.env.POSTGRES_DATABASE || '',
})

AWS.config.region = "ap-southeast-1";
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const airtableOutboundAscmSkusService = new AirtableOutboundAscmSkusService();
const airtableSKUMatchingService = new AirtableSKUMatchingService();
const airtableLazadaOrdersService = new AirtableLazadaOrdersService();
const airtableOutboundShopeeOrdersService = new AirtableOutboundShopeeOrdersService();
const airtableOutboundShopifyOrdersService = new AirtableOutboundShopifyOrdersService();

const URL_SQS_LAZADA_ORDERS = "https://sqs.ap-southeast-1.amazonaws.com/170274338432/migrate-airtable-to-aurora-lazadaOrders";
const URL_SQS_SHOPEE_ORDERS = "https://sqs.ap-southeast-1.amazonaws.com/170274338432/migrate-airtable-to-aurora-shopeeOrders"

const migratePTTBOutboundsASCMSkus = async(event) => {
    const client = await pool.connect();

    const res = await airtableOutboundAscmSkusService.getUnmigratedRows();
    console.log(res)

    if(res.records.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                result: res,
            }),
        }
    }

    let isError = false;
    let error;
    let context;
    try {
        await client.query("BEGIN");

        for(let i = 0; i < res.records.length; i++) {
            const row = res.records[i];
            const ascmSKU = _.get(row.fields, "Product ID \n(Max 13 Chars for 50x25mm Labels)\n*COMPULSORY FIELD");

            const skuMatchingID = await migrateSKUMatchingFromAirtableToPostgres(client, row, ascmSKU);
            console.log("Migrated SKU matching to Postgres")

            // Send SQS message for migrating lazada order
            await sqs.sendMessage({
                MessageBody: JSON.stringify({
                    "row": row,
                    "ascmSKU": ascmSKU,
                    "skuMatchingID": skuMatchingID,
                }),
                QueueUrl: URL_SQS_LAZADA_ORDERS,
                DelaySeconds: 0,
            }).promise()
            console.log("Published to lazada order migration job")

            // Send SQS message for migrating shopee order
            await sqs.sendMessage({
                MessageBody: JSON.stringify({
                    "row": row,
                    "ascmSKU": ascmSKU,
                    "skuMatchingID": skuMatchingID,
                }),
                QueueUrl: URL_SQS_SHOPEE_ORDERS,
                DelaySeconds: 0,
            }).promise()
            console.log("Published to shopee order migration job")
            
            // TODO: Need to know the Airtable table
            // await migrateShopifyOrderFromAirtableToPostgres(client, row, ascmSKU, skuMatchingID);
            
            await client.query(`
            INSERT INTO pttb_outbounds_ascmskus(
                airtable_record_id, ascm_sku, isg_qty_roll_up, 
                lazada_orders, lazada_qty_roll_up, product_description, 
                shopee_orders, shopee_qty_roll_up, sum_qty_total, 
                sku_matching_id 
            ) VALUES (
                $1, $2, $3,
                $4, $5, $6,
                $7, $8, $9,
                $10
            )
            ON CONFLICT (id) DO NOTHING;
            `, [
                row.id, _.get(row.fields, "Product ID \n(Max 13 Chars for 50x25mm Labels)\n*COMPULSORY FIELD"), _.get(row.fields, "ISG Qty Roll Up"), _
                .get(row.fields, ""), _.get(row.fields, "Lazada Qty Roll Up"), _.get(row.fields, "Product Description \n(Max 100 Chars)\n*COMPULSORY FIELD"), 
                _.get(row.fields, ""), _.get(row.fields, "Shopee Qty Roll Up"),  _.get(row.fields, "Sum Qty Total"), 
                skuMatchingID,
            ])
            console.log("Migrated ASCM SKUs to Postgres")
            
        }
    } catch(err) {  
        console.log("Inserting to Aurora")
        console.log(err);
        console.log(context);
        error = err;
        isError = true;
        await client.query("ROLLBACK");
        console.log("Rolled back")
    }

    if(isError === false) {
        await client.query("COMMIT");
        console.log("Commited")
    }

    client.release();

    if(isError === true) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to run migration",
                error: error,
                context: context,
            }),
        }
    }

    try {
        for(let i = 0; i < res.records.length; i++) {
            let row = res.records[i];
            context = row;
    
            row['is_migrated_to_aurora'] = true;
    
            await airtableOutboundAscmSkusService.markAsMigrated(row.id);
        }
        
    } catch(err) {
        console.log("Updating BE")
        console.log(err);
        console.log(context)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to run migration",
                error: err,
                context: context,
            }),
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            total: res.records.length,
            result: res.records,
        }),
    }
}

const migrateLazadaOrders = async(event) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for(const record of event.Records) {
            console.log(record.body);
            let body = JSON.parse(record.body);
            let row = _.get(body, "row");
            let ascmSKU = _.get(body, "ascmSKU");
            let skuMatchingID = _.get(body, "skuMatchingID");

            await migrateLazadaOrderFromAirtableToPostgres(client, row, ascmSKU, skuMatchingID);

            console.log("Migrated into Postgres")
        }

        await client.query("COMMIT");
    } catch(err) {
        console.log(err);

        await client.query("ROLLBACK");
    }
}

const migrateShopeeOrders = async(event) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for(const record of event.Records) {
            console.log(record.body);
            let body = JSON.parse(record.body);
            let row = _.get(body, "row");
            let ascmSKU = _.get(body, "ascmSKU");
            let skuMatchingID = _.get(body, "skuMatchingID");

            await migrateShopeeOrderFromAirtableToPostgres(client, row, ascmSKU, skuMatchingID);

            console.log("Migrated into Postgres")
        }

        await client.query("COMMIT");
    } catch(err) {
        console.log(err);
        
        await client.query("ROLLBACK");
    }
}

async function migrateSKUMatchingFromAirtableToPostgres(client, row, ascmSKU) {
    // TODO: Get SKU Matching
    const airtableMasterSkuID = _.get(row.fields, "LINK:MasterSKU(Synced)[0]");
    console.log("airtableMasterSkuID: ", airtableMasterSkuID);

    if(airtableMasterSkuID === undefined || airtableMasterSkuID === null) {
        return;
    };

    const matchingSKU = await airtableSKUMatchingService.getByID(airtableMasterSkuID);

    const masterSKU = _.get(matchingSKU.fields, "Master SKU Name");
    if(masterSKU === undefined || masterSKU === null) {
        return;
    }

    let dbMatchingSKU = await client.query(`
    SELECT id
    FROM sku_matching
    WHERE master_sku = $1
    `, [ masterSKU.toUpperCase() ])

    let skuMatchingID = _.get(dbMatchingSKU.rows, "[0].id");

    // TODO: Store SKU Matching
    if(skuMatchingID === undefined) {
        dbMatchingSKU = await client.query(`
        INSERT INTO sku_matching(
            item_name, master_sku
        ) VALUES (
            $1, $2
        )
        RETURNING id
        `, [
            _.get(matchingSKU.fields, "Item Name"), masterSKU.toUpperCase()
        ])

        skuMatchingID = _.get(dbMatchingSKU.rows, "[0].id");
    }

    return skuMatchingID;
}

async function migrateLazadaOrderFromAirtableToPostgres(client, row, ascmSKU, skuMatchingID) {
    const lazadaOrderIDs = _.get(row.fields, "Lazada Orders", []);

    if(lazadaOrderIDs.length === 0) {
        console.log("No lazada order for this record")
    }

    for(let i = 0; i < lazadaOrderIDs.length; i++) {
        console.log("Lazada order ID: ", lazadaOrderIDs[i])
        // TODO: Get lazada order
        let lazadaOrder = await airtableLazadaOrdersService.getByID(lazadaOrderIDs[i]);

        let res = await client.query(`
        SELECT id
        FROM lazada_orders
        WHERE airtable_record_id = $1
        `, [ lazadaOrderIDs[i] ])

        console.log(res);
        console.log(res.rows.length)

        if(res.rows.length > 0) {
            continue;
        }

        // TODO: Insert lazada order
        await client.query(`
        INSERT INTO lazada_orders(
            airtable_record_id, logistic_status, order_number,
            get_ascm_skus, ascm_final_skus, tracking_code,
            ascm_skus, seller_sku, customer_name,
            order_type, guarantee, delivery_type,
            lazada_id, lazada_sku, warehouse,
            create_time, update_time, rts_sla,
            tts_sla, invoice_required, invoice_number,
            delivered_date, customer_email, national_registration_number,
            shipping_name, shipping_address, shipping_address_2,
            shipping_address_3, shipping_address_4, shipping_address_5,

            shipping_phone, shipping_phone_2, shipping_city,
            shipping_post_code, shipping_country, shipping_region,
            billing_name, billing_addr, billing_addr_2,
            billing_addr_3, billing_addr_4, billing_addr_5,
            billing_phone, billing_phone_2, billing_city,
            billing_post_code, billing_country, tax_code,
            branch_number, tax_invoice_requested, pay_method,
            paid_price, unit_price, seller_discount_total,
            shipping_fee, wallet_credit, item_name,
            variation, cd_shipping_provider, shipping_provider,

            shipment_type_name, shipping_provider_type, cd_tracking_code,
            tracking_url, shipping_provider_fm, tracking_code_fm,
            tracking_url_fm, promised_shipping_time, premium,
            status, buyer_failed_delivery_return_initiator, buyer_failed_delivery_reason,
            buyer_failed_delivery_detail, buyer_failed_delivery_user_name, bundle_id,
            bundle_discount, refund_amount, sku_matching_id
        ) VALUES (
            $1, $2, $3,
            $4, $5, $6,
            $7, $8, $9,
            $10, $11, $12,
            $13, $14, $15,
            $16, $17, $18,
            $19, $20, $21,
            $22, $23, $24,
            $25, $26, $27,
            $28, $29, $30,

            $31, $32, $33,
            $34, $35, $36,
            $37, $38, $39,
            $40, $41, $42,
            $43, $44, $45,
            $46, $47, $48,
            $49, $50, $51,
            $52, $53, $54,
            $55, $56, $57,
            $58, $59, $60,

            $61, $62, $63,
            $64, $65, $66,
            $67, $68, $69,
            $70, $71, $72,
            $73, $74, $75,
            $76, $77, $78
        )
        `, [
            lazadaOrderIDs[i], _.get(lazadaOrder.fields, "LOGISTICS STATUS"), _.get(lazadaOrder.fields, "orderNumber"),
            _.get(lazadaOrder.fields, "GET ASCM SKUS"), _.get(lazadaOrder.fields, "ASCM Final SKUs"), _.get(lazadaOrder.fields, "trackingCode"),
            _.get(lazadaOrder.fields, "ASCM_SKUS"), _.get(lazadaOrder.fields, "sellerSku"), _.get(lazadaOrder.fields, "customerName"),
            _.get(lazadaOrder.fields, "orderType"), _.get(lazadaOrder.fields, "Guarantee"), _.get(lazadaOrder.fields, "deliveryType"),
            _.get(lazadaOrder.fields, "lazadaId"), _.get(lazadaOrder.fields, "lazadaSku"), _.get(lazadaOrder.fields, "wareHouse"),
            _.get(lazadaOrder.fields, "createTime"), _.get(lazadaOrder.fields, "updateTime"), _.get(lazadaOrder.fields, "rtsSla"),
            _.get(lazadaOrder.fields, "ttsSla"), _.get(lazadaOrder.fields, "invoiceRequired"), _.get(lazadaOrder.fields, "invoiceNumber"),
            _.get(lazadaOrder.fields, "deliveredDate"), _.get(lazadaOrder.fields, "customerEmail"), _.get(lazadaOrder.fields, "nationalRegistrationNumber"),
            _.get(lazadaOrder.fields, "shippingName"), _.get(lazadaOrder.fields, "shippingAddress"), _.get(lazadaOrder.fields, "shippingAddress2"),
            _.get(lazadaOrder.fields, "shippingAddress3"), _.get(lazadaOrder.fields, "shippingAddress4"), _.get(lazadaOrder.fields, "shippingAddress5"),

            _.get(lazadaOrder.fields, "shippingPhone"), _.get(lazadaOrder.fields, "shippingPhone2"), _.get(lazadaOrder.fields, "shippingCity"),
            _.get(lazadaOrder.fields, "shippingPostCode"), _.get(lazadaOrder.fields, "shippingCountry"), _.get(lazadaOrder.fields, "shippingRegion"),
            _.get(lazadaOrder.fields, "billingName"), _.get(lazadaOrder.fields, "billingAddr"), _.get(lazadaOrder.fields, "billingAddr2"),
            _.get(lazadaOrder.fields, "billingAddr3"), _.get(lazadaOrder.fields, "billingAddr4"), _.get(lazadaOrder.fields, "billingAddr5"),
            _.get(lazadaOrder.fields, "billingPhone"), _.get(lazadaOrder.fields, "billingPhone2"), _.get(lazadaOrder.fields, "billingCity"),
            _.get(lazadaOrder.fields, "billingPostCode"), _.get(lazadaOrder.fields, "billingCountry"), _.get(lazadaOrder.fields, "taxCode"),
            _.get(lazadaOrder.fields, "branchNumber"), _.get(lazadaOrder.fields, "taxInvoiceRequested"), _.get(lazadaOrder.fields, "payMethod"),
            _.get(lazadaOrder.fields, "paidPrice"), _.get(lazadaOrder.fields, "unitPrice"), _.get(lazadaOrder.fields, "sellerDiscountTotal"),
            _.get(lazadaOrder.fields, "shippingFee"), _.get(lazadaOrder.fields, "walletCredit"), _.get(lazadaOrder.fields, "itemName"),
            _.get(lazadaOrder.fields, "variation"), _.get(lazadaOrder.fields, "cdShippingProvider"), _.get(lazadaOrder.fields, "shippingProvider"),

            _.get(lazadaOrder.fields, "shipmentTypeName"), _.get(lazadaOrder.fields, "shippingProviderType"), _.get(lazadaOrder.fields, "cdTrackingCode"),
            _.get(lazadaOrder.fields, "trackingUrl"), _.get(lazadaOrder.fields, "shippingProviderFM"), _.get(lazadaOrder.fields, "trackingCodeFM"),
            _.get(lazadaOrder.fields, "trackingUrlFM"), _.get(lazadaOrder.fields, "promisedShippingTime"), _.get(lazadaOrder.fields, "premium"),
            _.get(lazadaOrder.fields, "status"), _.get(lazadaOrder.fields, "buyerFailedDeliveryReturnInitiator"), _.get(lazadaOrder.fields, "buyerFailedDeliveryReason"),
            _.get(lazadaOrder.fields, "buyerFailedDeliveryDetail"), _.get(lazadaOrder.fields, "buyerFailedDeliveryUserName"), _.get(lazadaOrder.fields, "bundleId"),
            _.get(lazadaOrder.fields, "bundleDiscount"), _.get(lazadaOrder.fields, "refundAmount"), skuMatchingID,
        ])
    }

    return;
}

async function migrateShopeeOrderFromAirtableToPostgres(client, row, ascmSKU, skuMatchingID) {
    const shopeeOrderIDs = _.get(row.fields, "Shopee Orders", []);

    if(shopeeOrderIDs.length === 0) {
        console.log("No shopee order for this record")
    }

    for(let i = 0; i < shopeeOrderIDs.length; i++) {
        console.log("Shopee order ID: ", shopeeOrderIDs[i])
        // TODO: Get shopee order
        let shopeeOrder = await airtableOutboundShopeeOrdersService.getByID(shopeeOrderIDs[i]);

        let res = await client.query(`
        SELECT id
        FROM pttb_outbounds_shopeeorders
        WHERE airtable_record_id = $1
        `, [ shopeeOrderIDs[i] ])

        console.log(res);
        console.log(res.rows.length)

        if(res.rows.length > 0) {
            continue;
        }

        // TODO: Insert shopee order
        await client.query(`
        INSERT INTO pttb_outbounds_shopeeorders(
            airtable_record_id, ascm_sku, bundle_deal_indicator,
            buyer_paid_shipping_fee, cancel_reason, city,
            commision_fee_incl_gst, country, credit_card_discount_total,
            deal_price, delivery_address, district,
            estimated_ship_out_date, estimated_shipping_fee, final_ascm_sku,
            get_ascm_sku, logistics_status, no_of_product_in_order,
            note, order_complete_time, order_creation_date,
            order_id, order_paid_time, order_status,
            order_total_weight, original_price, parent_sku_reference_no,
            phone_number, product_name, product_subtotal,

            province, quantity, receiver_name,
            remark_from_buyer, remarks_1, return_refund_status,
            reverse_shipping_fee, seller_absorbed_coin_cashback, seller_bundle_discount,
            seller_discount, seller_rebate, seller_voucher,
            service_fee_incl_gst, ship_time, shipment_method,
            shipping_option, shipping_rebate_estimate, shopee_bundle_discount,
            shopee_coins_offset, shopee_rebate, shopee_voucher,
            sku_full_name, sku_reference_no, sku_total_weight,
            store_name, total_amount, town, 
            tracking_number, transaction_fee_incl_gst, username_buyer, 
            
            variation_name, voucher_code, zip_code,
            sku_matching_id
        ) VALUES (
            $1, $2, $3,
            $4, $5, $6,
            $7, $8, $9,
            $10, $11, $12,
            $13, $14, $15,
            $16, $17, $18,
            $19, $20, $21,
            $22, $23, $24,
            $25, $26, $27,
            $28, $29, $30,
            $31, $32, $33,
            $34, $35, $36,
            $37, $38, $39,
            $40, $41, $42,
            $43, $44, $45,
            $46, $47, $48,
            $49, $50, $51,
            $52, $53, $54,
            $55, $56, $57,
            $58, $59, $60,
            $61, $62, $63,
            $64
        )
        `, [
            shopeeOrderIDs[i], _.get(shopeeOrder.fields, "ASCM_SKU[0]"), _.get(shopeeOrder.fields, "Bundle Deal Indicator"),
            _.get(shopeeOrder.fields, "Buyer Paid Shipping Fee"), _.get(shopeeOrder.fields, "Cancel Reason"), _.get(shopeeOrder.fields, "City"),
            _.get(shopeeOrder.fields, "Commission Fee (Incl. GST)"), _.get(shopeeOrder.fields, "Country"), _.get(shopeeOrder.fields, "Credit Card Discount Total"),
            _.get(shopeeOrder.fields, "Deal Price"), _.get(shopeeOrder.fields, "Delivery Address"), _.get(shopeeOrder.fields, "District"),
            _.get(shopeeOrder.fields, "Estimated Ship Out Date"), _.get(shopeeOrder.fields, "Estimated Shipping Fee"), _.get(shopeeOrder.fields, "Final ASCM SKU[0]"),
            _.get(shopeeOrder.fields, "GET ASCM SKU"), _.get(shopeeOrder.fields, "LOGISTICS STATUS"), _.get(shopeeOrder.fields, "No of product in order"),
            _.get(shopeeOrder.fields, "Note"), _.get(shopeeOrder.fields, "Order Complete Time"), _.get(shopeeOrder.fields, "Order Creation Date"),
            _.get(shopeeOrder.fields, "Order ID"), _.get(shopeeOrder.fields, "Order Paid Time"), _.get(shopeeOrder.fields, "Order Status"),
            _.get(shopeeOrder.fields, "Order Total Weight"), _.get(shopeeOrder.fields, "Original Price"), _.get(shopeeOrder.fields, "Parent SKU Reference No."),
            _.get(shopeeOrder.fields, "Phone Number"), _.get(shopeeOrder.fields, "Product Name"), _.get(shopeeOrder.fields, "Product Subtotal"),

            _.get(shopeeOrder.fields, "Province"), _.get(shopeeOrder.fields, "Quantity"), _.get(shopeeOrder.fields, "Receiver Name"),
            _.get(shopeeOrder.fields, "Remark from buyer"), _.get(shopeeOrder.fields, ""), _.get(shopeeOrder.fields, "Return / Refund Status"),
            _.get(shopeeOrder.fields, ""), _.get(shopeeOrder.fields, "Seller Absorbed Coin Cashback"), _.get(shopeeOrder.fields, "Seller Bundle Discount"),
            _.get(shopeeOrder.fields, "Seller Discount"), _.get(shopeeOrder.fields, "Seller Rebate"), _.get(shopeeOrder.fields, "Seller Voucher"),
            _.get(shopeeOrder.fields, "Service Fee (incl. GST)"), _.get(shopeeOrder.fields, "Ship Time"), _.get(shopeeOrder.fields, "Shipment Method"),
            _.get(shopeeOrder.fields, "Shipping Option"), _.get(shopeeOrder.fields, "Shipping Rebate Estimate"), _.get(shopeeOrder.fields, "Shopee Bundle Discount"),
            _.get(shopeeOrder.fields, "Shopee Coins Offset"), _.get(shopeeOrder.fields, "Shopee Rebate"), _.get(shopeeOrder.fields, "Shopee Voucher"),
            _.get(shopeeOrder.fields, "SKU Full Name[0]"), _.get(shopeeOrder.fields, "SKU Reference No."), _.get(shopeeOrder.fields, "SKU Total Weight"),
            _.get(shopeeOrder.fields, ""), _.get(shopeeOrder.fields, "Total Amount"),  _.get(shopeeOrder.fields, "Town"),
            _.get(shopeeOrder.fields, "Tracking Number*"), _.get(shopeeOrder.fields, "Transaction Fee(Incl. GST)"), _.get(shopeeOrder.fields, "Username (Buyer)"), 
            
            _.get(shopeeOrder.fields, "Variation Name"), _.get(shopeeOrder.fields, "Voucher Code"), _.get(shopeeOrder.fields, "Zip Code"), 
            skuMatchingID,
        ])
    }

    return;
}

// TODO: Need to know the Airtable table
async function migrateShopifyOrderFromAirtableToPostgres(client, row, ascmSKU, skuMatchingID) {
    const shopifyOrderIDs = _.get(row.fields, "New ISG Orders Table", []);
    for(let shopifyOrderID in shopifyOrderIDs) {
        let shopifyOrder = await airtableOutboundShopifyOrdersService.getByID(shopifyOrderID);

        let res = await client.query(`
        SELECT id
        FROM pttb_outbounds_shopifyorders
        WHERE airtable_record_id = $1
        `, [ shopifyOrderID ])

        if(res.rows.length > 0) {
            continue;
        }

        // TODO: Need to know the Airtable table
        await client.query(`
        INSERT INTO pttb_outbounds_shopifyorders(
            airtable_record_id, ascm_id, ascm_uftracking,
            cancelled_at, created_at, created_time,
            discount_amount, discount_code, email,
            email_text_repeat, final_ascm_ids, final_uf_tracking,
            financial_status, fulfillment_status, internal_order_number,
            latest_uf_status, line_item_name, line_item_price,
            line_item_quantity, line_item_sku, link_ascm_skus,
            link_auto_uf_submit, link_auto_uf_submit_ascm, mobile_repeat,
            name, note_attributes, notes,
            payment_method, shipping_address1, shipping_address2,

            shipping_company, shipping_method, shipping_name,
            shipping_phone, shipping_repeat, shipping_street,
            shipping_zip, status, store_name,
            tags, test_date_field, to_ship_courier,
            total, uf_tracking, sku_matching_id
        ) VALUES (
            $1, $2, $3,
            $4, $5, $6,
            $7, $8, $9,
            $10, $11, $12,
            $13, $14, $15,
            $16, $17, $18,
            $19, $20, $21,
            $22, $23, $24,
            $25, $26, $27,
            $28, $29, $30,
            $31, $32, $33,
            $34, $35, $36,
            $37, $38, $39,
            $40, $41, $42,
            $43, $44, $45
        )
        `, [
            shopifyOrderID, _.get(""), _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),

            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
            _.get(""),  _.get(""),  _.get(""),
        ])
    }

    return;
}

module.exports = {
    migratePTTBOutboundsASCMSkus,
    migrateLazadaOrders,
    migrateShopeeOrders,
}
