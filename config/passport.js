'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local');
// const crypto = require('crypto');

// TODO ストラテジの本実装を行う
passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, password, done) {
            console.log(email);
            console.log(password);

            return done(null, {
                id: '1',
                email: 'email',
                password: 'password'
            });
        }
    )
);

// TODO serializeUserの本実装を行う
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

// TODO deserializeUserの本実装を行う
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

module.exports = passport;
