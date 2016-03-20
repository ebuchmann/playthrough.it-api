module.exports = function(db) {
    const Collection = db.Collection;

    const Item = db.extend({
        collection: 'items',

        configure() {
            this.after('create', 'increment');
            this.after('remove', 'decrement');
        },

        * increment() {
            const collection = yield Collection.findById(String(this.attributes.collectionId));
            collection.set('games', collection.attributes.games + 1);
            yield collection.save();
        },

        * decrement() {
            const collection = yield Collection.findById(String(this.attributes.collectionId));
            if (this.attributes.status === 'Finished') {
                collection.set('completed', collection.attributes.completed - 1);
            }
            collection.set('games', collection.attributes.games - 1);
            yield collection.save();
        },
    });

    db.Item = Item;
};
