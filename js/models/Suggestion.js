const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const suggestionSchema = new Schema({
    suggestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    suggestedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    game: { type: Schema.Types.ObjectId, ref: 'Game' },
    challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
    status: String,
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
