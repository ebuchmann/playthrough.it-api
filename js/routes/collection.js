'use strict';
const route = require('koa-route');
const path = require('path');
const debug = require('debug')('play:route:challenge');

module.exports = function(app, db) {
    const { Challenge, Item, Game } = db.models;
    /*
        PUBLIC ROUTES
    */

    // Get all collections
    app.use(route.get('/collections', function*() {
        this.status = 200;
        this.body = {
            type: 'collections',
            attributes: yield Challenge.find().populate('user'),
        };
    }));

    // Gets a single Collection
    app.use(route.get('/collections/:id', function*(id) {
        this.status = 200;
        this.body = {
            type: 'collections',
            _id: id,
            attributes: yield Challenge.findById(id).populate('user'),
        };
    }));

    // Get collections for a specific user
    app.use(route.get('/collections/user/:id', function*(id) {
        this.status = 201;
        this.body = {
            type: 'collections',
            attributes: yield Challenge.find({ user: id }).populate('user'),
        };
    }));

    /*
        PRIVATE ROUTES, REQUIRES AUTHENTICATION ON ALL ROUTES
    */

    // Updates a collection
    app.use(route.patch('/collections/:id', function*(id) {
        if (!this.isAuthenticated()) this.throw('You must be logged in to edit a collection.', 403);

        const data = this.request.body.attributes;
        const collection = yield Challenge.findById(id);

        for (let key in data) {
            collection.set(key, data[key]);
        }

        this.status = 200;
        this.body = {
            type: 'collections',
            _id: id,
            attributes: {
                collection: yield collection.save(),
            },
        };
    }));

    // Create a new, empty, collection for a user
    app.use(route.post('/collections', function*() {
        if (!this.isAuthenticated()) this.throw('You must be logged in to start a new collection.', 403);

        const newChallenge = yield new Challenge({
            user: this.passport.user._id,
            title: this.request.body.attributes.title,
        }).save();

        this.status = 201;
        this.body = {
            type: 'collections',
            _id: newChallenge._id,
            attributes: newChallenge,
        };
    }));

    // Removes a challengeId
    // TODO: remove any items related to the challenge
    // TODO: verify the logged in user is the owner of the challenge
    app.use(route.delete('/challenges/:id', function*(id) {
        debug(`removing ${id}`);

        this.status = 201;
        this.body = {
            type: 'challenges',
            attributes: yield Challenge.findByIdAndRemove(id),
        };
    }));
};
