'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const pool = require('../db/pool');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, password, cb) {
            pool.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
                if (err) {
                    return cb(err);
                }

                if (result.rows.length === 0) {
                    console.error('Incorrect email or password.');
                    return cb(null, false, { message: 'Incorrect email or password.' });
                }

                const user = result.rows[0];
                crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
                    if (err) {
                        return cb(err);
                    }
                    if (user.hashed_password !== hashedPassword.toString('base64')) {
                        console.error('Incorrect email or password.');
                        return cb(null, false, { message: 'Incorrect email or password.' });
                    }
                    return cb(null, user);
                });
            });
        }
    )
);

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (userId, cb) {
    pool.query('SELECT * FROM users WHERE id = $1', [userId], (err, result) => {
        if (err) {
            return cb(err);
        } else {
            return cb(null, result.rows[0]);
        }
    });
});

module.exports = passport;
