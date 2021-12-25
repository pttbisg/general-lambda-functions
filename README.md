# General Lambda Functions

## List of Lambda Functions
|Functions|URL|Description|
|--------|--------|--------|
|isgOrderSourceToASCMLogistics|/airtable/ascm-logistics|Populate Shopify order & delivery tracking data from PTTB:Outbound > ISGOrderSource|
|getInventoryByUserID|/inventory|Retrieve inventory information by user ID|
|sendOutSKUOutbounds|/sku_outbounds/{sku_outbound_id}/send_out|Send out item from SKU_Outbound|
|sendOutSKUOutboundISGOrders|/sku_outbound_isgorders/{sku_outbound_isgorder_id}/send_out|Send out item from SKU_OutboundISGOrder|

## Development
### Pre-requisites
- [Install serverless CLI in your local machine](https://www.serverless.com/framework/docs/getting-started/)
- [Set PTTB AWS configuration in your local machine](https://www.serverless.com/framework/docs/providers/aws/cli-reference/config-credentials/)

### How to run offline
- `AWS_PROFILE=<name of your preferred AWS profile in your local machine> sls offline`

### How to deploy
- `sls deploy --aws-profile <name of your preferred AWS profile in your local machine>`

### How to update table in RDS

#### Create new script

- For script creation, please use [migrate-go](https://github.com/golang-migrate/migrate)
- It create 2 files, `.up.sql` and `.down.sql`
- `.up.sql` is a script that would be run to update your database
- `.down.sql` is a script to revert your database into previous state before you run `.up.sql`
- Hence, when you create `.up.sql`, please fill in `.down.sql` with the mindset on how to revert into previous state.

#### Update database in RDS Aurora

- To update into latest version, use **POST /migration/up**
- To revert into previous verion, use **POST /migration/goto/{version}**
- When there is something wrong with your script and the migration is failed, use **POST /migration/force/{version}** by checking the problematic version, and then use **POST /migration/goto/{version}** with the previous stable version, fix the SQL, and then re-migrate it again by using **POST /migration/up**

- Then, deploy it into the production

### Migration to AWS RDS Aurora

#### Coverage

##### Airtable

- ASCM_SKUs
- Shopee Orders
- Lazada Orders

##### Backendless

- PTTBOutbounds_ASCMSKUS
- PTTBOutbounds_ShopeeOrders
- PTTBOutbounds_ShopifyOrders
- Helpwise_conversations
- SKU_matching
- SKU_localSKU

#### How to run Airtable -> Aurora migration

- Run `node migration_runner_airtable.js`
- Please be aware that it may fail on the 1st run because of cold-start on Aurora serverless. If that's the case, please wait for a couple seconds, and then re-run it again

#### How to run BE -> Aurora migration

- Run `node migration_runner_airtable.js`
- Please be aware that it may fail on the 1st run because of cold-start on Aurora serverless. If that's the case, please wait for a couple seconds, and then re-run it again
