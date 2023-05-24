'use strict';

const { Pool } = require('pg');
// eslint-disable-next-line node/no-unpublished-require
const dbConstant = require('../config/const').DB;

const pool = new Pool({
    host: dbConstant.HOST,
    database: dbConstant.DATABASE,
    port: dbConstant.PORT,
    user: dbConstant.USER,
    password: dbConstant.PASSWORD
});

module.exports = pool;
