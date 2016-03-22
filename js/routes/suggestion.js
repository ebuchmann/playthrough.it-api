const route = require('koa-route');
const debug = require('debug')('play:route:suggestion');
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
    const Suggestion = db.Suggestion;
    const Game = db.Game;
    const User = db.User;
    const Item = db.Item;

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
            attributes: yield Suggestion.populate('game', Game).populate('suggestedBy', User).where('collection', new ObjectID(collectionId)).where('status', 'New').find(),
        };
    }));

    // Accept suggestion
    app.use(route.post('/suggestions/:suggestionId/accept', function*(suggestionId) {
        const suggestion = yield Suggestion.findById(suggestionId);

        const item = yield new Item({
            collectionId: suggestion.attributes.collection,
            game: suggestion.attributes.game,
            status: 'Unfinished',
            time: '',
            completed_on: '',
        }).save();

        suggestion.set('status', 'Accepted');
        yield suggestion.save();

        this.status = 201;
        this.body = {
            type: 'items',
            attributes: yield Item.populate('game', Game).findById(String(item.attributes._id)),
        };
    }));

    // Decline suggestion
    app.use(route.post('/suggestions/:suggestionId/decline', function*(suggestionId) {

    }));

    // User suggests a game to another user
    app.use(route.post('/suggestions/', function*() {
        if (!this.isAuthenticated()) this.throw('You must be logged in to suggest a game.', 403);

        const data = this.request.body.attributes;

        if (yield Suggestion.and({ suggestedTo: new ObjectID(data.suggestedTo), game: new ObjectID(data.game) }).count()) this.throw('Someone already suggested this game.', 400);

        const newSuggestion = yield new Suggestion({
            suggestedBy: this.passport.user.attributes._id,
            suggestedTo: new ObjectID(data.suggestedTo),
            game: new ObjectID(data.game),
            collection: new ObjectID(data.collection),
            status: 'New',
        }).save();

        this.status = 201;
        this.body = {
            type: 'suggestions',
            attributes: newSuggestion,
        };
    }));
};
