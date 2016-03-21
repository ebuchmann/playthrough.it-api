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
            attributes: yield Suggestion.populate('game', Game).populate('suggestedBy', User).where('collection', new ObjectID(collectionId)).find(),
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
    app.use(route.post('/suggestions/:userId/:gameId', function*(userId, gameId) {
        if (!this.isAuthenticated()) this.throw('You must be logged in to suggest a game.', 403);

        const alreadySuggested = yield Suggestion.where('game', new ObjectID(gameId)).where('suggestedTo', new ObjectID(userId)).findOne();
        if (alreadySuggested) this.throw('Someone already suggested this game.', 400);

        const newSuggestion = yield new Suggestion({
            suggestedBy: this.passport.user.attributes._id,
            suggestedTo: new ObjectID(userId),
            game: new ObjectID(gameId),
            status: 'new',
        }).save();

        this.status = 201;
        this.body = {
            type: 'suggestions',
            attributes: newSuggestion,
        };
    }));
};
