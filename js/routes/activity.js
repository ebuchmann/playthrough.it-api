const route = require('koa-route');
const debug = require('debug')('play:route:activity');

module.exports = function(app, db) {
    const { Activity } = db.models;
    /*
        PUBLIC ROUTES
    */

    app.use(route.get('/activities', function*() {
        debug('route');
        this.status = 201;
        this.body = {
            type: 'activities',
            attributes: yield Activity.find().populate('user', 'username'),
        };
    }));

    /*
        PRIVATE ROUTES, REQUIRES AUTHENTICATION ON ALL ROUTES
    */
};
