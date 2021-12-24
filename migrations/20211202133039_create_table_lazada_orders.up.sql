begin;

create table if not exists lazada_orders (
    id uuid not null primary key default uuid_generate_v4(),
    created timestamp with time zone default current_timestamp not null,
    updated timestamp with time zone,
    airtable_record_id text,
    logistic_status text,
    order_number text,
    get_ascm_skus boolean,
    ascm_final_skus text,
    tracking_code text,
    ascm_skus text,
    seller_sku text,
    customer_name text,
    order_type text,
    guarantee text,
    delivery_type text,
    lazada_id text,
    lazada_sku text,
    warehouse text,
    create_time timestamp with time zone,
    update_time timestamp with time zone,
    rts_sla text,
    tts_sla timestamp with time zone,
    invoice_required text,
    invoice_number text,
    delivered_date timestamp with time zone,
    customer_email text,
    national_registration_number text,
    shipping_name text,
    shipping_address text,
    shipping_address_2 text,
    shipping_address_3 text,
    shipping_address_4 text,
    shipping_address_5 text,
    shipping_phone text,
    shipping_phone_2 text,
    shipping_city text,
    shipping_post_code int,
    shipping_country text,
    shipping_region text,
    billing_name text,
    billing_addr text,
    billing_addr_2 text,
    billing_addr_3 text,
    billing_addr_4 text,
    billing_addr_5 text,
    billing_phone text,
    billing_phone_2 text,
    billing_city text,
    billing_post_code int,
    billing_country text,
    tax_code int,
    branch_number int,
    tax_invoice_requested boolean,
    pay_method text,
    paid_price float,
    unit_price float,
    seller_discount_total float,
    shipping_fee float,
    wallet_credit text,
    item_name text,
    variation text,
    cd_shipping_provider text,
    shipping_provider text,
    shipment_type_name text,
    shipping_provider_type text,
    cd_tracking_code text,
    tracking_url text,
    shipping_provider_fm text,
    tracking_code_fm text,
    tracking_url_fm text,
    promised_shipping_time text,
    premium text,
    status text,
    buyer_failed_delivery_return_initiator text,
    buyer_failed_delivery_reason text,
    buyer_failed_delivery_detail text,
    buyer_failed_delivery_user_name text,
    bundle_id text,
    bundle_discount text,
    refund_amount text
);

commit;