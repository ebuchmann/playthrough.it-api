module.exports = function(db) {
    const Platform = db.extend({
        collection: 'platforms',
    });

    db.Platform = Platform;
};
