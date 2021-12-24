begin;

alter table lazada_orders
add column sku_matching_id uuid;

commit;
