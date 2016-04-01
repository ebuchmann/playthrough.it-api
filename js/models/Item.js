// * increment() {
//     const collection = yield Collection.findById(String(this.attributes.collectionId));
//     collection.set('games', collection.attributes.games + 1);
//     yield collection.save();
// },
//
// * decrement() {
//     const collection = yield Collection.findById(String(this.attributes.collectionId));
//     if (this.attributes.status === 'Finished') {
//         collection.set('completed', collection.attributes.completed - 1);
//     }
//     collection.set('games', collection.attributes.games - 1);
//     yield collection.save();
// },

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
    game: { type: Schema.Types.ObjectId, ref: 'Game' },
    status: String,
    time: Number,
    completed_on: Date,
});

module.exports = mongoose.model('Item', itemSchema);
