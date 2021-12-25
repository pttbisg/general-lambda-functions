begin;

    create table if not exists helpwise_conversations
    (
        id uuid primary key default uuid_generate_v4() not null,
        created timestamp with time zone default current_timestamp not null,
        updated timestamp with time zone,
        owner_id text,
        message_id text not null unique,
        conversation_id text,
        mailbox_id int,
        message_body text,
        message_direction text,
        message_type text,
        receiver text,
        sender text,
        status text,
        tag text
    );
    
commit;
