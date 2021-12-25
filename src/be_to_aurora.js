"use strict";

const { Pool } = require('pg');
const axios = require("axios");
const _ = require('lodash');

const {
    SKUMatchingService,
    HelpwiseConversationsService,
    PTTBOutboundsShopeeOrdersService,
    PTTBOutboundsShopifyOrdersService,
    PTTBOutboundsAscmSkusService,
    LocalSKUService,
} = require('./services/backendless');

const pool = new Pool({
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
    host: process.env.POSTGRES_HOST || '',
    port: process.env.POSTGRES_PORT || '',
    database: process.env.POSTGRES_DATABASE || '',
})

const skuMatchingService = new SKUMatchingService();
const helpwiseConversationsService = new HelpwiseConversationsService();
const pttbOutboundsShopeeOrdersService = new PTTBOutboundsShopeeOrdersService();
const pttbOutboundsShopifyOrdersService = new PTTBOutboundsShopifyOrdersService();
const pttbOutboundsAscmSkusService = new PTTBOutboundsAscmSkusService();
const localSKUService = new LocalSKUService();

const ping = async(event) => {
    const res = await pool.query("SELECT NOW()");

    return {
        statusCode: 200,
        body: JSON.stringify(res),
    }
}

const pingInternet = async(event) => {
    const res = await axios.get("https://google.com")
    return {
        statusCode: 200,
        body: JSON.stringify(res.data),
    }
}

const migrateSKUMatching = async(event) => {
    const client = await pool.connect();

    const res = await skuMatchingService.getUnmigratedRows();

    if(res.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                total: res.length,
                result: res,
            }),
        }
    }

    let isError = false;
    let error;
    let context;
    try {
        await client.query("BEGIN");

        for(let i = 0; i < res.length; i++) {
            let row = res[i];
            context = row;

            await client.query(`
            INSERT INTO sku_matching(
                owner_id, airtable_record_id, barcode,
                brand_name, ignore_localsku, ignore_store_name,
                isolation_level_enum, item_name, master_sku,
                variant_id, id, created,
                updated
            ) VALUES (
                $1, $2, $3,
                $4, $5, $6,
                $7, $8, $9,
                $10, $11, $12,
                $13
            )
            ON CONFLICT (id) DO NOTHING;
            `, [
                row['ownerId'], row['AirtableRecordID'], row['Barcode'],
                row['BrandName'], row['IGNORE_localSKU'], row['IGNOREStore_Name'],
                row['isolationLevelEnum'], row['ItemName'], row['masterSKU'],
                row['variantID'], row['objectId'], new Date(row['created']),
                new Date(row['updated']),
            ])
            
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
        for(let i = 0; i < res.length; i++) {
            console.log(i)
            let row = res[i];
            context = row;
    
            row['is_migrated_to_aurora'] = true;
    
            await skuMatchingService.put(row['objectId'], row);
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
            total: res.length,
            result: res,
        }),
    }
};

const migrateHelpwiseConversations = async(event) => {
    const client = await pool.connect();

    const res = await helpwiseConversationsService.getUnmigratedRows();

    if(res.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                total: res.length,
                result: res,
            }),
        }
    }

    let isError = false;
    let error;
    let context;
    try {
        await client.query("BEGIN");

        for(let i = 0; i < res.length; i++) {
            let row = res[i];
            context = row;

            await client.query(`
            INSERT INTO helpwise_conversations(
                id, created, updated,
                owner_id, message_id, conversation_id,
                mailbox_id, message_body, message_direction,
                message_type, receiver, sender,
                status, tag
            ) VALUES (
                $1, $2, $3,
                $4, $5, $6,
                $7, $8, $9,
                $10, $11, $12,
                $13, $14
            )
            ON CONFLICT (id) DO NOTHING;
            `, [
                row['objectId'], new Date(row['created']), new Date(row['updated']),
                row['ownerId'], row['messageId'], row['conversationId'],
                row['mailboxId'], row['messageBody'], row['messageDirection'],
                row['messageType'], row['receiver'], row['sender'],
                row['status'], row['tag'],
            ])
            
        }
    } catch(err) {  
        console.log("Inserting to Aurora")
        console.log(err);
        console.log(context);
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
        for(let i = 0; i < res.length; i++) {
            console.log(i)
            let row = res[i];
            context = row;
    
            row['is_migrated_to_aurora'] = true;
    
            await helpwiseConversationsService.put(row['objectId'], row);
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
            total: res.length,
            result: res,
        }),
    }
}

const migratePTTBOutboundsASCMSkus = async(event) => {
    const client = await pool.connect();

    const res = await pttbOutboundsAscmSkusService.getUnmigratedRows();
    console.log(res)

    if(res.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                total: res.length,
                result: res,
            }),
        }
    }

    let isError = false;
    let error;
    let context;
    try {
        await client.query("BEGIN");

        for(let i = 0; i < res.length; i++) {
            let row = res[i];
            context = row;

            await client.query(`
            INSERT INTO pttb_outbounds_ascmskus(
                id, created, updated,
                owner_id, airtable_record_id, ascm_sku,
                isg_qty_roll_up, lazada_orders, lazada_qty_roll_up,
                new_isg_orders_table, product_description, shopee_orders,
                shopee_qty_roll_up, sum_qty_total, sku_matching_id
            ) VALUES (
                $1, $2, $3,
                $4, $5, $6,
                $7, $8, $9,
                $10, $11, $12,
                $13, $14, $15
            )
            ON CONFLICT (id) DO NOTHING;
            `, [
                row['objectId'], new Date(row['created']), new Date(row['updated']),
                row['ownerId'], row['AirtableRecordID'], row['ASCM_SKU'],
                row['ISG_Qty_Roll_Up'], row['Lazada_Orders'], row['Lazada_Qty_Roll_Up'],
                row['New_ISG_Orders_Table'], row['Product_Description'], row['Shopee_Orders'],
                row['Shopee_Qty_Roll_Up'], row['Sum_Qty_Total'], _.get(row, "LINK_SKUMatching.objectId"),
            ])
            
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
        for(let i = 0; i < res.length; i++) {
            console.log(i)
            let row = res[i];
            context = row;
    
            row['is_migrated_to_aurora'] = true;
    
            await pttbOutboundsAscmSkusService.put(row['objectId'], row);
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
            total: res.length,
            result: res,
        }),
    }
};

const migratePTTBOutboundsShopeeOrders = async(event) => {
    const client = await pool.connect();

    const res = await pttbOutboundsShopeeOrdersService.getUnmigratedRows();

    if(res.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                total: res.length,
                result: res,
            }),
        }
    }

    let isError = false;
    let error;
    let context;
    try {
        await client.query("BEGIN");

        for(let i = 0; i < res.length; i++) {
            let row = res[i];
            context = row;

            await client.query(`
            INSERT INTO pttb_outbounds_shopeeorders(
                id, created, updated,
                owner_id, airtable_record_id, ascm_sku,
                bundle_deal_indicator, buyer_paid_shipping_fee, cancel_reason,
                city, commision_fee_incl_gst, country,
                credit_card_discount_total, deal_price, delivery_address,
                district, estimated_ship_out_date, estimated_shipping_fee,
                final_ascm_sku, get_ascm_sku, logistics_status,
                no_of_product_in_order, note, order_complete_time,
                order_creation_date, order_id, order_paid_time,
                order_status, order_total_weight, original_price,

                parent_sku_reference_no, phone_number, product_name,
                product_subtotal, province, quantity,
                receiver_name, remark_from_buyer, remarks_1,
                return_refund_status, reverse_shipping_fee, seller_absorbed_coin_cashback,
                seller_bundle_discount, seller_discount, seller_rebate,
                seller_voucher, server_fee_incl_gst, ship_time,
                shipment_method, shipping_option, shipping_rebate_estimate,
                shopee_bundle_discount, shopee_coins_offset, shopee_rebate,
                shopee_voucher, sku_full_name, sku_reference_no,
                sku_total_weight, store_name, total_amount,

                town, tracking_number, transaction_fee_incl_gst,
                username_buyer, variation_name, voucher_code,
                zip_code, sku_matching_id 
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
                $67, $68
            )
            ON CONFLICT (id) DO NOTHING;
            `, [
                row['objectId'], new Date(row['created']), new Date(row['updated']),
                row['ownerId'], row['AirtableRecordID'], row['ASCM_SKU'],
                row['Bundle_Deal_Indicator'], row['Buyer_Paid_Shipping_Fee'], row['Cancel_reason'],
                row['City'], row['Commission_Fee_Incl_GST'], row['Country'],
                row['Credit_Card_Discount_Total'], row['Deal_Price'], row['Delivery_Address'],
                row['District'], row['Estimated_Ship_Out_Date'], row['Estimated_Shipping_Fee'],
                row['Final_ASCM_SKU'], row['GET_ASCM_SKU'], row['LOGISTICS_STATUS'],
                row['No_of_product_in_order'], row['Note'], row['Order_Complete_Time'],
                row['Order_Creation_Date'], row['Order_ID'], row['Order_Paid_Time'],
                row['Order_Status'], row['Order_Total_Weight'], row['Original_Price'],

                row['Parent_SKU_Reference_No'], row['Phone_Number'], row['OrigiProduct_Namenal_Price'],
                row['Product_Subtotal'], row['Province'], row['Quantity'],
                row['Receiver_Name'], row['Remark_from_buyer'], row['Remarks_1'],
                row['Return_Refund_Status'], row['Reverse_Shipping_Fee'], row['Seller_Absorbed_Coin_Cashback'],
                row['Seller_Bundle_Discount'], row['Seller_Discount'], row['Seller_Rebate'],
                row['Seller_Voucher'], row['Service_Fee_incl_GST'], row['Ship_Time'],
                row['Shipment_Method'], row['Shipping_Option'], row['Shipping_Rebate_Estimate'],
                row['Shopee_Bundle_Discount'], row['Shopee_Coins_Offset'], row['Shopee_Rebate'],
                row['Shopee_Voucher'], row['SKU_Full_Name'], row['SKU_Reference_No'],
                row['SKU_Total_Weight'], row['Store_Name'], row['Total_Amount'],

                row['Town'], row['Tracking_Number'], row['Transaction_Fee_Incl_GST'],
                row['Username_Buyer'], row['Variation_Name'], row['Voucher_Code'],
                row['Zip_Code'], _.get(row, "LINK_SKUMatching.objectId"),
            ])
            
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
        for(let i = 0; i < res.length; i++) {
            console.log(i)
            let row = res[i];
            context = row;
    
            row['is_migrated_to_aurora'] = true;
    
            await pttbOutboundsShopeeOrdersService.put(row['objectId'], row);
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
            total: res.length,
            result: res,
        }),
    }
};

const migratePTTBOutboundsShopifyOrders = async(event) => {
    const client = await pool.connect();

    const res = await pttbOutboundsShopifyOrdersService.getUnmigratedRows();

    if(res.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                total: res.length,
                result: res,
            }),
        }
    }

    let isError = false;
    let error;
    let context;
    try {
        await client.query("BEGIN");

        for(let i = 0; i < res.length; i++) {
            let row = res[i];
            context = row;

            await client.query(`
            INSERT INTO pttb_outbounds_shopifyorders(
                id, created, updated,
                owner_id, airtable_record_id, ascm_id,
                ascm_uftracking, cancelled_at, created_at,
                created_time, discount_amount, discount_code,
                email, email_text_repeat, final_ascm_ids,
                final_uf_tracking, financial_status, fulfillment_status,
                internal_order_number, latest_uf_status, line_item_name,
                line_item_price, line_item_quantity, line_item_sku,
                link_ascm_skus, link_auto_uf_submit, link_auto_uf_submit_ascm,
                mobile_repeat, name, note_attributes,

                notes, payment_method, shipping_address1,
                shipping_address2, shipping_company, shipping_country,
                shipping_method, shipping_name, shipping_phone, 
                shipping_repeat, shipping_street, shipping_zip, 
                status, store_name, tags, 
                test_date_field, to_ship_courier, total, 
                uf_tracking, sku_matching_id
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
                $49, $50
            )
            ON CONFLICT (id) DO NOTHING;
            `, [
                row['objectId'], new Date(row['created']), new Date(row['updated']),
                row['ownerId'], row['AirtableRecordID'], row['ASCM_ID'],
                row['ASCM_UFTracking'], new Date(row['Cancelled_at']), new Date(row['Created_at']),
                new Date(row['Created_Time']), row['Discount_Amount'], row['Discount_Code'],
                row['Email'], row['Email_Text_Repeat'], row['Final_ASCM_IDs'],
                row['FinalUFTracking'], row['Financial_Status'], row['Fulfillment_Status'],
                row['Internal_Order_Number'], row['LatestUFStatus'], row['Lineitem_name'],
                row['Lineitem_price'], row['Lineitem_quantity'], row['Lineitem_sku'],
                row['LINK_ASCM_SKUs'], row['LINK_AutoUFSubmit'], row['LINK_AutoUFSubmitASCM'],
                row['Mobile_Repeat'], row['Name'], row['Note_Attributes'],

                row['Notes'], row['Payment_Method'], row['Shipping_Address1'],
                row['Shipping_Address2'], row['Shipping_Company'], row['Shipping_Country'],
                row['Shipping_Method'], row['Shipping_Name'], row['Shipping_Phone'],
                row['Shipping_Repeat'], row['Shipping_Street'], row['Shipping_Zip'],
                row['STATUS'], row['Store_Name'], row['Tags'],
                new Date(row['Test_Date_Field']), row['To_Ship_Courier'], row['Total'],
                row['UFTracking'], _.get(row, "LINK_SKUMatching.objectId"),
            ])
            
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
        for(let i = 0; i < res.length; i++) {
            console.log(i)
            let row = res[i];
            context = row;
    
            row['is_migrated_to_aurora'] = true;
    
            await pttbOutboundsShopifyOrdersService.put(row['objectId'], row);
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
            total: res.length,
            result: res,
        }),
    }

};

const migrateLocalSKU = async(event) => {
    const client = await pool.connect();

    const res = await localSKUService.getUnmigratedRows();

    if(res.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                total: res.length,
                result: res,
            }),
        }
    }

    let isError = false;
    let error;
    let context;
    try {
        await client.query("BEGIN");

        for(let i = 0; i < res.length; i++) {
            console.log(i)
            let row = res[i];
            context = row;

            await client.query(`
            INSERT INTO sku_localsku(
                id, created, updated,
                owner_id, airtable_record_id, item_name_final,
                local_alt_barcodes, local_barcode, local_sku,
                shopify_product_id, shopify_variant_id, store_name,
                sku_matching_id
            ) VALUES (
                $1, $2, $3,
                $4, $5, $6,
                $7, $8, $9,
                $10, $11, $12,
                $13
            )
            ON CONFLICT (id) DO NOTHING;
            `, [
                row['objectId'], new Date(row['created']), new Date(row['updated']),
                row['ownerId'], row['AirtableRecordID'], row['ItemNameFinal'],
                row['localAltBarcodes'], row['localBarcode'], row['localSKU'],
                row['ownerShopifyProductIDId'], row['ShopifyVariantID'], row['Store_Name'],
                _.get(row, "LINK_SKUMatching.objectId"),
            ])
            
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
        for(let i = 0; i < res.length; i++) {
            console.log(i)
            let row = res[i];
            context = row;
    
            row['is_migrated_to_aurora'] = true;
    
            await localSKUService.put(row['objectId'], row);
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
            total: res.length,
            result: res,
        }),
    }
};

module.exports = {
    ping,
    pingInternet,
    migrateSKUMatching,
    migrateHelpwiseConversations,
    migratePTTBOutboundsASCMSkus,
    migratePTTBOutboundsShopeeOrders,
    migratePTTBOutboundsShopifyOrders,
    migrateLocalSKU,
}
