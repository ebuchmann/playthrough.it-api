module.exports = function(db) {
    const Collection = db.extend({
        collection: 'collections',
    });

    db.Collection = Collection;
};
