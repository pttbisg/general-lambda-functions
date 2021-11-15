begin;

alter table pttb_outbounds_ascmskus
add constraint pttb_outbounds_ascmskus_foreign_key_sku_matching
foreign key (sku_matching_id)
references sku_matching(id);

alter table pttb_outbounds_shopeeorders
add constraint pttb_outbounds_shopeeorders_foreign_key_sku_matching
foreign key (sku_matching_id)
references sku_matching(id);

alter table pttb_outbounds_shopifyorders
add constraint pttb_outbounds_shopifyorders_foreign_key_sku_matching
foreign key (sku_matching_id)
references sku_matching(id);

alter table sku_localsku
add constraint sku_localsku_foreign_key_sku_matching
foreign key (sku_matching_id)
references sku_matching(id);

commit;
