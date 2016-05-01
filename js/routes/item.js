const route = require('koa-route');
const debug = require('debug')('play:route:item');

module.exports = function(app, db) {
    const { Activity, Challenge, Item, Game } = db.models;
    /*
        PUBLIC ROUTES
    */

    // Gets a collections game list
    app.use(route.get('/items/collection/:id', function*(id) {
        this.status = 200;
        this.body = {
            type: 'items',
            attributes: yield Item.find({ challenge: id }).populate('game'),
        };
    }));

    // Removes a game from a collection
    // TODO: Check if logged in user matches Item -> Collection -> User
    app.use(route.delete('/items/:id', function*(id) {
        (yield Item.findById(id)).remove();
        this.status = 204;
    }));

    // Updates fields on the items
    app.use(route.patch('/items/:id', function*(id) {
        const data = this.request.body.attributes;

        const currentItem = yield Item.findById(id).populate('game');
        const collection = yield Challenge.findById(currentItem.challenge);

        if (data.status) {
            if (data.status === 'Finished' && currentItem.status !== 'Finished') {
                collection.set('completed', collection.completed + 1);
            }
            if (data.status !== 'Finished' && currentItem.status === 'Finished') {
                collection.set('completed', collection.completed - 1);
            }
            if (data.status === 'In Progress') {
                collection.set('current', currentItem.game.title);
            }
            if (data.status !== 'In Progress' && currentItem.status === 'In Progress') {
                collection.set('current', null);
                const inProgress = yield Item.find({ collectionId: currentItem.collectionId, status: 'In Progress' }).populate('game');
                if (inProgress) {
                    const otherProgress = inProgress.find(item => String(item._id) !== String(currentItem._id));
                    if (otherProgress) {
                        collection.set('current', otherProgress.game.title);
                    }
                }
            }
        }

        for (const key in data) {
            currentItem.set(key, data[key]);
        }

        // TODO: Actually make middleware to handle all this
        yield new Activity({
            user: this.passport.user._id,
            item: currentItem._id,
            type: 'items',
            message: `${this.passport.user.username} completed ${currentItem.game.title} on ${currentItem.game.platform}`,
        }).save();

        this.status = 200;
        this.body = {
            type: 'items',
            _id: id,
            attributes: {
                item: yield currentItem.save(),
                collection: yield collection.save(),
            },
        };
    }));

    /*
        PRIVATE ROUTES
    */

    // Adds a game to a collection
    // TODO: move this over to "items"
    app.use(route.post('/collections/:collectionId/games/:gameId', function*(collectionId, gameId) {
        if (!this.isAuthenticated()) this.throw('You must be logged in to add games to a collection.', 403);

        if (!(yield Challenge.find({ _id: collectionId, user: this.passport.user._id }).count())) this.throw('You can only edit collections you own.', 403);

        const item = yield new Item({
            challenge: collectionId,
            game: gameId,
        }).save();

        this.status = 201;
        this.body = {
            type: 'collections',
            _id: item._id,
            attributes: yield Item.findById(item._id).populate('game'),
        };
    }));
};
