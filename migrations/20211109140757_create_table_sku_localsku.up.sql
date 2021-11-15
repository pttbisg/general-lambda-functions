begin;

create table if not exists sku_localsku
(
    id uuid not null primary key default uuid_generate_v4(),
    created timestamp with time zone default current_timestamp not null,
    updated timestamp with time zone,
    owner_id text,
    airtable_record_id text,
    item_name_final text,
    local_alt_barcodes json,
    local_barcode text,
    local_sku text,
    shopify_product_id text,
    shopify_variant_id text,
    store_name text,
    -- relational fields
    sku_matching_id uuid
);

commit;
