const route = require('koa-route');
const debug = require('debug')('play:route:game');
const Mongorito = require('mongorito');
const Model = Mongorito.Model;
Mongorito.connect('localhost');

const Game = Model.extend({
    collection: 'games',
});

module.exports = function(app, db) {

    /*
        PUBLIC ROUTES
    */

    app.use(route.post('/games/search', function*() {
        const data = this.request.body.attributes;

        const results = yield data.filter === '*'
        ? Game.where('title', new RegExp(`^${data.query}`, 'i')).find()
        : Game.where('title', new RegExp(`^${data.query}`, 'i')).where('platform', data.filter).find();

        this.status = 200;
        this.body = {
            results,
        };
    }));

    /*
        PRIVATE ROUTES
    */
};
