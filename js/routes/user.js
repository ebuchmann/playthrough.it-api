const route = require('koa-route');
const debug = require('debug')('play:route:collection');
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
    const User = db.Collection;

    /*
        PUBLIC ROUTES
    */

    /*
        PRIVATE ROUTES, REQUIRES AUTHENTICATION ON ALL ROUTES
    */

    // Fetches currently logged in user
    app.use(route.get('/users/current', function*() {
        this.status = 200;
        if (this.isAuthenticated()) this.body = this.passport.user;
        else this.body = false;
    }));
};