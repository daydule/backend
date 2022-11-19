'use strict';

const express = require('express');
const app = express();

const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const csurf = require('csurf');

// eslint-disable-next-line node/no-unpublished-require
const secret = require('./config/secret');
const passport = require('./config/passport');
const pool = require('./db/pool');
const auth = require('./controllers/auth');
const plan = require('./controllers/plan');
const loginCheck = require('./middlewares/loginCheck');
const user = require('./controllers/user');
const port = secret.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use(csurf());

app.use(passport.initialize());
app.use(passport.session());
app.use('/', auth);

app.use(loginCheck);

app.use('/user', user);
app.use('/plan', plan);

// sample code start ----------
app.get('/', (req, res) => {
    res.json({
        message: 'daydule',
        _csrf: req.csrfToken()
    });
});

app.post('/', (req, res) => {
    res.json({
        message: 'daydulexxxxx'
    });
});

app.get('/notFound', (req, res) => {
    res.json({
        message: '404 not found',
        hoge: 'hoge',
        _csrf: req.csrfToken()
    });
});

// sample code end ----------

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
