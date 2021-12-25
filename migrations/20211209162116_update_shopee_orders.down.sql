begin;

alter table pttb_outbounds_shopeeorders
rename column service_fee_incl_gst
to server_fee_incl_gst;

commit;
