const route = require('koa-route');
const debug = require('debug')('play:route:collection');
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
    const Collection = db.Collection;
    const Item = db.Item;
    const Game = db.Game;
    const User = db.User;

    /*
        PUBLIC ROUTES
    */

    // Get all collections
    app.use(route.get('/collections', function*() {
        this.status = 200;
        this.body = {
            type: 'collections',
            attributes: yield Collection.populate('user', User).find(),
        };
    }));

    // Gets a single Collection
    app.use(route.get('/collections/:id', function*(id) {
        this.status = 200;
        this.body = {
            type: 'collections',
            _id: id,
            attributes: yield Collection.populate('user', User).findById(String(id)),
        };
    }));

    // Adds a game to a collection
    // TODO: move this over to "items"
    app.use(route.post('/collections/:collectionId/games/:gameId', function*(collectionId, gameId) {
        const item = yield new Item({
            collectionId: new ObjectID(collectionId),
            game: new ObjectID(gameId),
            status: 'Unfinished',
            time: '',
            completed_on: '',
        }).save();

        this.status = 201;
        this.body = {
            type: 'collections',
            _id: item._id,
            attributes: yield Item.populate('game', Game).findById(String(item.attributes._id)),
        };
    }));

    // Updates a collection
    app.use(route.patch('/collections/:id', function*(id) {
        const data = this.request.body.attributes;
        const collection = yield Collection.findById(id);

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
            attributes: yield Collection.populate('user', User).where('user', new ObjectID(id)).find(),
        };
    }));

    /*
        PRIVATE ROUTES, REQUIRES AUTHENTICATION ON ALL ROUTES
    */

    // Create a new, empty, collection for a user
    app.use(route.post('/collections', function*() {
        if (!this.isAuthenticated()) this.throw('You must be logged in to create a new collection.', 403);

        const newCollection = yield new Collection({
            user: this.passport.user.attributes._id,
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
