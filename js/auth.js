'use strict';

const passport = require('koa-passport');
const env = process.env.NODE_ENV || 'development';
const credentials = require('../credentials')(env);
const route = require('koa-route');
const debug = require('debug')('play:auth');

module.exports = function(app, db) {

    const User = db.User;
    const TwitterStrategy = require('passport-twitter').Strategy;
    const TwitchStrategy = require('passport-twitch').Strategy;
    const FacebookStrategy = require('passport-facebook').Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    // Twitter
    passport.serializeUser((user, done) => {
        done(null, user.attributes._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => {
            done(null, user);
        });
    });

    passport.use(new TwitchStrategy(credentials.twitch, (token, tokenSecret, profile, done) => {
        process.nextTick(() => {
            try {
                User.where('twitch', profile.id).findOne().then(user => {
                    if (user) {
                        done(null, user);
                    } else {
                        new User({
                            twitch: profile.id,
                            username: profile.username,
                            email: profile.email,
                            maxCollections: 5,
                        }).save().then(u => {
                            done(null, u);
                        });
                    }
                });
            } catch (err) {
                debug(err);
            }
        });
    }));

    passport.use(new FacebookStrategy(credentials.facebook, (token, tokenSecret, profile, done) => {
        process.nextTick(() => {
            try {
                User.where('facebook', profile.id).findOne().then(user => {
                    if (user) {
                        done(null, user);
                    } else {
                        debug(profile);
                        new User({
                            facebook: profile.id,
                            username: profile.displayName,
                            maxCollections: 5,
                        }).save().then(u => {
                            done(null, u);
                        });
                    }
                });
            } catch (err) {
                debug(err);
            }
        });
    }));

    passport.use(new TwitterStrategy(credentials.twitter, (token, tokenSecret, profile, done) => {
        // retrieve user ...
        process.nextTick(() => {
            try {
                User.where('twitter', profile.id).findOne().then(user => {
                    if (user) {
                        debug('found');
                        done(null, user);
                    } else {
                        new User({
                            twitter: profile.id,
                            username: profile.displayName,
                            maxCollections: 5,
                        }).save().then(u => {
                            done(null, u);
                        });
                    }
                });
            } catch (err) {
                debug('error');
                debug(err);
            }
        });
    }));

    app.use(route.get('/auth/twitter', passport.authenticate('twitter')));
    app.use(route.get('/auth/twitch', passport.authenticate('twitch')));
    app.use(route.get('/auth/facebook', passport.authenticate('facebook')));

    app.use(route.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/test',
        failureRedirect: '/fail',
    })));

    app.use(route.get('/auth/twitch/callback', passport.authenticate('twitch', {
        successRedirect: '/test',
        failureRedirect: '/fail',
    })));

    app.use(route.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/test',
        failureRedirect: '/fail',
    })));

    // logout
    app.use(route.get('/logout', function*() {
        this.status = 200;
        this.logout();
    }));
};
