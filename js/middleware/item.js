// const debug = require('debug')('play:middle:item');
const co = require('co');

module.exports = function (db) {
    const { Item, Challenge } = db.models;

    Item.on('afterInsert', item => {
        co(function *() {
            const challenge = yield Challenge.findById(item.challenge);
            challenge.set('games', challenge.games + 1);
            yield challenge.save();
        });
    });

    Item.on('afterRemove', item => {
        co(function *() {
            const challenge = yield Challenge.findById(item.challenge);
            if (item.status === 'Finished') {
                challenge.set('completed', challenge.completed - 1);
            }
            challenge.set('games', challenge.games - 1);
            yield challenge.save();
        });
    });
};
