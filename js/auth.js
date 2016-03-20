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
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        new User({ id: id }).fetch().then(user => {
            debug(user);
            done(null, user);
        });
    });


    passport.use(new TwitterStrategy(credentials.twitter, function(token, tokenSecret, profile, done) {
        // retrieve user ...
        process.nextTick(function() {

            try {
                new User({ twitter_id: profile.id }).fetch().then(user => {
                    if(user) {
                        debug('user found');
                        debug(token);
                        return done(null, user);
                    } else {
                        debug('user not found');
                        new User({ twitter_id: profile.id, username: profile.username })
                        .save()
                        .then(user => {
                            debug(token);
                            return done(null, user);
                        });
                    }
                });
            } catch(err) {
                debug('error');
                debug(err);
            }
        });
    }));

    app.use(route.get('/auth/twitter', passport.authenticate('twitter')));

    app.use(route.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/test',
        failureRedirect: '/',
    })));

    // Fetches currently logged in user
    app.use(route.get('/users/current', function*() {
        // this.logout();
        // debug(this);
        // this.body = this.request.header;
        if(this.isAuthenticated()) {
            this.body = this.passport.user;
        } else {
            this.body = 'no';
        }
    }));

    // logout
    app.use(route.get('/logout', function*() {
        this.logout();
    }));
};
