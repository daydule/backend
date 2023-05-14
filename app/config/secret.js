'use strict';

// eslint-disable-next-line node/no-unpublished-require
require('dotenv').config();
const env = process.env;

module.exports = {
    port: env.BACKEND_PORT,
    db: {
        // ローカル
        // host: 'postgres',
        // 本番
        host: env.DB_HOST,
        database: env.DB_NAME,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASS
    },
    cookieSecret: 'cookieSecret',
    guestPassword: env.GUEST_PASSWORD,
    guestUsername: env.GUEST_USERNAME,
    guestDomain: env.GUEST_DOMAIN
};
