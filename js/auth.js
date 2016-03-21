'use strict';

const passport = require('koa-passport');
const env = process.env.NODE_ENV || 'development';
const credentials = require('../credentials')(env);
const route = require('koa-route');
const debug = require('debug')('play:auth');

module.exports = function(app, db) {

    const User = db.User;
    const TwitterStrategy = require('passport-twitter').Strategy;

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


    passport.use(new TwitterStrategy(credentials.twitter, (token, tokenSecret, profile, done) => {
        // retrieve user ...
        process.nextTick(() => {
            try {
                User.where('twitter', profile.id).findOne().then(user => {
                    if (user) {
                        debug('found');
                        done(null, user);
                    } else {
                        debug('not found');
                        debug(profile);
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
