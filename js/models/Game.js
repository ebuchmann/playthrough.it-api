module.exports = function(db) {
    const Game = db.extend({
        collection: 'games',
    });

    db.Game = Game;
};
