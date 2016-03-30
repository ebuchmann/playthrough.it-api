const route = require('koa-route');
const debug = require('debug')('play:route:collection');
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
    const Item = db.Item;
    const Game = db.Game;
    const User = db.User;
    const Activity = db.Activity;

    /*
        PUBLIC ROUTES
    */

    app.use(route.get('/activities', function*() {
        this.status = 201;
        this.body = {
            type: 'activities',
            attributes: yield Activity.populate('item', Item).populate('user', User).find(),
        };
    }));

    /*
        PRIVATE ROUTES, REQUIRES AUTHENTICATION ON ALL ROUTES
    */
};
