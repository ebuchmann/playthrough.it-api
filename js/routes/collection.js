const route = require('koa-route');
const debug = require('debug')('play:route:collection');
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
    const Collection = db.Collection;
    const Item = db.Item;
    const Game = db.Game;

    /*
        PUBLIC ROUTES
    */

    // Get all collections
    app.use(route.get('/collections', function*() {
        this.status = 200;
        this.body = {
            type: 'collections',
            attributes: yield Collection.all(),
        };
    }));

    // Gets a single Collection
    app.use(route.get('/collections/:id', function*(id) {
        this.status = 200;
        this.body = {
            type: 'collections',
            _id: id,
            attributes: yield Collection.findById(String(id)),
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

    // Gets a collections game list
    // TODO: should be moved over to the items file
    app.use(route.get('/collections/:id/games', function*(id) {
        this.status = 200;
        this.body = {
            type: 'collections',
            _id: id,
            attributes: yield Item.populate('game', Game).where('collectionId', new ObjectID(id)).find(),
        };
    }));

    // Updates a collection
    app.use(route.patch('/collections/:id', function*(id) {
        const data = this.request.body.attributes;
        debug(data);
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

    /*
        PRIVATE ROUTES
    */

    app.use(route.post('/collections', function*() {
        const newCollection = yield new Collection({
            title: this.request.body.attributes.title,
            games: 0,
            completed: 0,
            current: '',
            owner: 'ebuchmann', // TODO: grab logged in user when you have them
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
            type: 'collections,',
            _id: newCollection._id,
            attributes: newCollection,
        };
    }));
};
