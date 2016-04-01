const route = require('koa-route');
const debug = require('debug')('play:route:suggestion');

module.exports = function(app, db) {
    const { Item, Suggestion } = db.models;
    /*
        PUBLIC ROUTES
    */

    /*
        PRIVATE ROUTES, REQUIRES AUTHENTICATION ON ALL ROUTES
    */

    // Gets suggested games for a collection
    app.use(route.get('/suggestions/:collectionId', function*(collectionId) {
        this.status = 201;
        this.body = {
            type: 'suggestions',
            attributes: yield Suggestion.find({ status: 'New', collection: collectionId }).populate('game').populate('suggestedBy'),
        };
    }));

    // Accept suggestion
    app.use(route.post('/suggestions/:suggestionId/accept', function*(suggestionId) {
        const suggestion = yield Suggestion.findById(suggestionId);

        const item = yield new Item({
            collectionId: suggestion.collection,
            game: suggestion.game,
            status: 'Unfinished',
            time: '',
            completed_on: '',
        }).save();

        suggestion.set('status', 'Accepted');
        yield suggestion.save();

        this.status = 201;
        this.body = {
            type: 'items',
            attributes: yield Item.findById(item._id).populate('game'),
        };
    }));

    // Decline suggestion
    app.use(route.post('/suggestions/:suggestionId/decline', function*(suggestionId) {

    }));

    // User suggests a game to another user
    app.use(route.post('/suggestions/', function*() {
        if (!this.isAuthenticated()) this.throw('You must be logged in to suggest a game.', 403);

        const data = this.request.body.attributes;

        if (yield Suggestion.find({ suggestedTo: data.suggestedTo, game: data.game }).count()) this.throw('Someone already suggested this game.', 400);

        const newSuggestion = yield new Suggestion({
            suggestedBy: this.passport.user._id,
            suggestedTo: data.suggestedTo,
            game: data.game,
            collection: data.collection,
            status: 'New',
        }).save();

        this.status = 201;
        this.body = {
            type: 'suggestions',
            attributes: newSuggestion,
        };
    }));
};
