'use strict';

const { Pool } = require('pg');
// eslint-disable-next-line node/no-unpublished-require
const dbSecret = require('../config/secret').db;

const pool = new Pool({
    host: dbSecret.host,
    database: dbSecret.database,
    port: dbSecret.port,
    user: dbSecret.user,
    password: dbSecret.password
});

module.exports = pool;
