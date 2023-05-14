'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
app.use(morgan('combined'));
// eslint-disable-next-line node/no-unpublished-require
require('dotenv').config();
const env = process.env;
app.use(
    cors({
        origin: env.FRONTEND_HOST,
        credentials: true
    })
);

const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
// TODO: csrfトークンが必要になったタイミングでコメントアウトを外す
// const csurf = require('csurf');

// eslint-disable-next-line node/no-unpublished-require
const secret = require('./config/secret');
const passport = require('./config/passport');
const pool = require('./db/pool');
const auth = require('./controllers/auth');
const user = require('./controllers/user');
const plan = require('./controllers/plan');
const recurringPlan = require('./controllers/recurringPlan');
const schedule = require('./controllers/schedule');
const loginCheck = require('./middlewares/loginCheck');
const port = secret.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    expressSession({
        store: new pgSession({
            pool: pool,
            tableName: 'session'
        }),
        secret: secret.cookieSecret,
        resave: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: env.COOKIE_HTTP_ONLY === 'true',
            domain: env.FRONTEND_DOMAIN
        },
        saveUninitialized: false
    })
);
// TODO: csrfトークンが必要になったタイミングでコメントアウトを外す
// app.use(csurf());

app.use(passport.initialize());
app.use(passport.session());
app.use('/', auth);

app.use(loginCheck);

app.use('/user', user);
app.use('/plan', plan);
app.use('/recurringPlan', recurringPlan);
app.use('/schedule', schedule);

app.use((req, res) => {
    console.error('Page accessed is missing.');
    res.status(404).json({ isError: true, errorId: 'NotFound', errorMessage: 'ページが見つかりませんでした。' });
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
