begin;

create table if not exists sku_matching
(
    id uuid not null primary key default uuid_generate_v4(),
    created timestamp with time zone default current_timestamp not null,
    updated timestamp with time zone,
    owner_id text,
    airtable_record_id text,
    barcode text,
    brand_name text,
    ignore_localsku text,
    ignore_store_name text,
    isolation_level_enum text,
    item_name text,
    master_sku text,
    variant_id text
);

commit;
