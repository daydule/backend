'use strict';

const express = require('express');
const app = express();

const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);

// eslint-disable-next-line node/no-unpublished-require
const secret = require('./config/secret');
const passport = require('./config/passport');
const pool = require('./db/pool');
const auth = require('./controllers/auth');
const port = secret.port;

app.use(
    expressSession({
        store: new pgSession({
            pool: pool,
            tableName: 'session'
            // Insert connect-pg-simple options here
        }),
        secret: secret.cookieSecret,
        resave: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
        // Insert express-session options here
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/', auth);

// sample code start ----------
app.get('/', (req, res) => {
    res.json({
        message: 'daydule'
    });
});

app.get('/notFound', (req, res) => {
    res.json({
        message: '404 not found'
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
