'use strict';
const passport = require('koa-passport');
const env = process.env.NODE_ENV || 'development';
const credentials = require('../credentials')(env);
const route = require('koa-route');
const debug = require('debug')('play:auth');
const co = require('co');

module.exports = function (app, db) {
    const { User } = db.models;

    const TwitterStrategy = require('passport-twitter').Strategy;
    const TwitchStrategy = require('passport-twitch').Strategy;
    const FacebookStrategy = require('passport-facebook').Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => {
            done(null, user);
        });
    });

    passport.use(new TwitchStrategy(credentials.twitch, (token, tokenSecret, profile, done) => {
        co(function *() {
            let user = yield User.findOne({ twitch: profile.id });
            if (!user) {
                user = yield new User({
                    twitch: profile.id,
                    username: profile.username,
                    email: profile.email,
                    maxCollections: 5,
                }).save();
            }
            done(null, user);
        });
    }));

    passport.use(new FacebookStrategy(credentials.facebook, (token, tokenSecret, profile, done) => {
        co(function *() {
            debug(this.res);
            if (!this.passport.user) {
                let user = yield User.findOne({ facebook: profile.id });
                if (!user) {
                    user = yield new User({
                        facebook: profile.id,
                        username: profile.displayName,
                        maxCollections: 5,
                    }).save();
                }
                done(null, user);
            } else {
                debug('you are log in');
            }
        });
    }));

    passport.use(new TwitterStrategy(credentials.twitter, (token, tokenSecret, profile, done) => {
        co(function *() {
            let user = yield User.findOne({ twitter: profile.id });
            if (!user) {
                user = yield new User({
                    twitter: profile.id,
                    username: profile.displayName,
                    maxCollections: 5,
                }).save();
            }
            done(null, user);
        });
    }));

    // Authorize new account with social media
    app.use(route.get('/auth/twitter', passport.authenticate('twitter')));
    app.use(route.get('/auth/twitch', passport.authenticate('twitch')));
    app.use(route.get('/auth/facebook', passport.authenticate('facebook')));

    app.use(route.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/login',
        failureRedirect: '/fail',
    })));

    app.use(route.get('/auth/twitch/callback', passport.authenticate('twitch', {
        successRedirect: '/login',
        failureRedirect: '/fail',
    })));

    app.use(route.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/login',
        failureRedirect: '/fail',
    })));

    // Connect users account with another social media platform
    app.use(route.get('/connect/twitch', passport.authorize('twitch')));
    app.use(route.get('/connect/facebook', passport.authorize('facebook')));

    app.use(route.get('/connect/twitch/callback', passport.authorize('twitch'), {
        successRedirect: '/login',
        failureRedirect: '/fail',
    }));

    app.use(route.get('/connect/facebook/callback', passport.authorize('facebook'), {
        successRedirect: '/login',
        failureRedirect: '/fail',
    }));

    // logout
    app.use(route.get('/logout', function*() {
        this.status = 200;
        this.logout();
    }));
};
