"use strict";

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
    host: process.env.POSTGRES_HOST || '',
    port: process.env.POSTGRES_PORT || '',
    database: process.env.POSTGRES_DATABASE || '',
})

const ping = async(event) => {
    const res = await pool.query("SELECT NOW()");

    console.log(res);

    return {
        statusCode: 200,
        body: JSON.stringify(res),
    }
}

module.exports = {
    ping,
}
