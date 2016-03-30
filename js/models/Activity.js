module.exports = function(db) {
    const Activity = db.extend({
        collection: 'activities',
    });

    db.Activity = Activity;
};
