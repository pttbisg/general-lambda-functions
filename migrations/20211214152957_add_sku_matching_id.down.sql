begin;

alter table lazada_orders
drop column sku_matching_id;

commit;
