const route = require('koa-route');
const path = require('path');

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

    // Adds a game to a collection
    // TODO: move this over to "items"
    app.use(route.post('/collections/:challengeId/games/:gameId', function*(challengeId, gameId) {
        const item = yield new Item({
            challenge: challengeId,
            game: gameId,
            status: 'Unfinished',
            time: '',
            completed_on: '',
        }).save();

        this.status = 201;
        this.body = {
            type: 'collections',
            _id: item._id,
            attributes: yield Item.findById(item._id).populate('game'),
        };
    }));

    // Updates a collection
    app.use(route.patch('/collections/:id', function*(id) {
        const data = this.request.body.attributes;
        const collection = yield Challenge.findById(id);

        for (const key in data) {
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

    // Create a new, empty, collection for a user
    app.use(route.post('/collections', function*() {
        if (!this.isAuthenticated()) this.throw('You must be logged in to create a new collection.', 403);

        const newCollection = yield new Collection({
            user: this.passport.user._id,
            title: this.request.body.attributes.title,
            games: 0,
            completed: 0,
            current: '',
            active: true,
            public: true,
            suggestions: true,
            display: {
                name: true,
                platform: true,
                genres: true,
                time: true,
                date: true,
                rating: true,
                deaths: true,
            },
        }).save();

        this.status = 201;
        this.body = {
            type: 'collections',
            _id: newCollection._id,
            attributes: newCollection,
        };
    }));
};
