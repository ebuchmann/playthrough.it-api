module.exports = function(db) {
    const User = db.extend({
        collection: 'users',
    });

    db.User = User;
};
