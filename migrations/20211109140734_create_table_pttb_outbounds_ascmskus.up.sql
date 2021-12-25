begin;

    create table if not exists pttb_outbounds_ascmskus
    (
        id uuid primary key default uuid_generate_v4() not null ,
        created timestamp with time zone default current_timestamp not null,
        updated timestamp with time zone,
        owner_id text,
        airtable_record_id text,
        ascm_sku text,
        isg_qty_roll_up int,
        lazada_orders text,
        lazada_qty_roll_up int,
        new_isg_orders_table text,
        product_description text,
        shopee_orders text,
        shopee_qty_roll_up int,
        sum_qty_total float,
        -- relational fields
        sku_matching_id uuid
    );

commit;
