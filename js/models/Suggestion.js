module.exports = function(db) {
    const Suggestion = db.extend({
        collection: 'suggestions',
    });

    db.Suggestion = Suggestion;
};
