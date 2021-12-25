begin;

alter table pttb_outbounds_shopeeorders
rename column server_fee_incl_gst
to service_fee_incl_gst;

commit;
