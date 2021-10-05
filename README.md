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
