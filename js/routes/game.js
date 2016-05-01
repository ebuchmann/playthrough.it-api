const route = require('koa-route');
const debug = require('debug')('play:route:game');

module.exports = function(app, db) {
    const { Game } = db.models;
    /*
        PUBLIC ROUTES
    */

    app.use(route.post('/games/search', function*() {
        const { query, filter } = this.request.body.attributes;

        const results = yield filter === '*'
        ? Game.find({ title: new RegExp(`^${query}`, 'i') })
        : Game.find({ title: new RegExp(`^${query}`, 'i'), platform: filter });

        this.status = 200;
        this.body = {
            results,
        };
    }));

    /*
        PRIVATE ROUTES
    */
};
