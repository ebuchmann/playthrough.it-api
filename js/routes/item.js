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
                const inProgress = yield Item.populate('game', Game).where({ collectionId: currentItem.collectionId, status: 'In Progress' }).find();
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
};
