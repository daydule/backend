'use strict';

const express = require('express');
const app = express();
const auth = require('./routes/auth');
// eslint-disable-next-line node/no-unpublished-require
const secret = require('./config/secret');
const port = secret.port;

const pool = require('./db/pool');

app.use('/', auth);

// sample code start ----------
app.get('/', (req, res) => {
    res.json({
        hello: 'daydule'
    });
});

app.get('/memo', function (req, res, next) {
    // SELECT
    pool.query('SELECT * FROM memo', function (error, results) {
        // エラーの場合
        if (error) {
            throw error;
        }

        // 正常なら取得したデータを返却
        res.status(200).json({
            data: results.rows
        });
        return next();
    });
});
// sample code end ----------

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
