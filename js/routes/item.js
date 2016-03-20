const route = require('koa-route');
const debug = require('debug')('play:route:item');
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
    const Collection = db.Collection;
    const Item = db.Item;
    const Game = db.Game;

    /*
        PUBLIC ROUTES
    */

    // Removes a game from a collection
    app.use(route.delete('/items/:id', function*(id) {
        (yield Item.findById(id)).remove();
        this.status = 204;
    }));

    // Updates fields on the items
    app.use(route.patch('/items/:id', function*(id) {
        const data = this.request.body.attributes;

        const currentItem = yield Item.populate('game', Game).findById(id);
        const collection = yield Collection.findById(currentItem.attributes.collectionId);

        if (data.status) {
            if (data.status === 'Finished' && currentItem.attributes.status !== 'Finished') {
                collection.set('completed', collection.attributes.completed + 1);
            }
            if (data.status !== 'Finished' && currentItem.attributes.status === 'Finished') {
                collection.set('completed', collection.attributes.completed - 1);
            }
            if (data.status === 'In Progress') {
                collection.set('current', currentItem.attributes.game.attributes.title);
            }
            if (data.status !== 'In Progress' && currentItem.attributes.status === 'In Progress') {
                collection.set('current', null);
                const inProgress = yield Item.populate('game', Game).where({ collectionId: currentItem.attributes.collectionId, status: 'In Progress' }).find();
                if (inProgress) {
                    const otherProgress = inProgress.find(item => String(item.attributes._id) !== String(currentItem.attributes._id));
                    if (otherProgress) {
                        collection.set('current', otherProgress.attributes.game.attributes.title);
                    }
                }
            }
        }

        for (const key in data) {
            currentItem.set(key, data[key]);
        }

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
