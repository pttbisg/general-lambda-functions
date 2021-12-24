"use strict";

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { Pool } = require('pg');
const axios = require("axios");

const POSTGRES = {
    HOST: process.env.POSTGRES_HOST || "",
    PORT: process.env.POSTGRES_PORT || "",
    USER: process.env.POSTGRES_USER || "",
    PASSWORD: process.env.POSTGRES_PASSWORD || "",
    DATABASE: process.env.POSTGRES_DATABASE || "",
};

class PostgresMigrationService {
    constructor() {
    };

    async up() {
        try {
            const { stdout, stderr } = await exec(`./migrations/migrate -path ./migrations -database postgres://${POSTGRES.USER}:${POSTGRES.PASSWORD}@${POSTGRES.HOST}:${POSTGRES.PORT}/${POSTGRES.DATABASE}?sslmode=disable up`);

            if(stderr) {
                console.log(`stderr: ${stderr}`);
            }

            console.log(`stdout: ${stdout}`);
        } catch(err) {
            throw err;
        }
    };

    async force(timestamp) {
        try {
            const { stdout, stderr } = await exec(`./migrations/migrate -path ./migrations -database postgres://${POSTGRES.USER}:${POSTGRES.PASSWORD}@${POSTGRES.HOST}:${POSTGRES.PORT}/${POSTGRES.DATABASE}?sslmode=disable force ${timestamp}`);

            if(stderr) {
                console.log(`stderr: ${stderr}`);
            }

            console.log(`stdout: ${stdout}`);
        } catch(err) {
            throw err;
        }
    };

    async goto(timestamp) {
        try {
            const { stdout, stderr } = await exec(`./migrations/migrate -path ./migrations -database postgres://${POSTGRES.USER}:${POSTGRES.PASSWORD}@${POSTGRES.HOST}:${POSTGRES.PORT}/${POSTGRES.DATABASE}?sslmode=disable goto ${timestamp}`);

            if(stderr) {
                console.log(`stderr: ${stderr}`);
            }

            console.log(`stdout: ${stdout}`);
        } catch(err) {
            throw err;
        }
    };

    async drop() {
        try {
            const { stdout, stderr } = await exec(`./migrations/migrate -path ./migrations -database postgres://${POSTGRES.USER}:${POSTGRES.PASSWORD}@${POSTGRES.HOST}:${POSTGRES.PORT}/${POSTGRES.DATABASE}?sslmode=disable drop -f`);

            if(stderr) {
                console.log(`stderr: ${stderr}`);
            }

            console.log(`stdout: ${stdout}`);
        } catch(err) {
            throw err;
        }
    };
}

class SKUMatchingService {
    constructor() {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER || '',
            password: process.env.POSTGRES_PASSWORD || '',
            host: process.env.POSTGRES_HOST || '',
            port: process.env.POSTGRES_PORT || '',
            database: process.env.POSTGRES_DATABASE || '',
        })
    };
}

module.exports = {
    SKUMatchingService,
    PostgresMigrationService,
}
