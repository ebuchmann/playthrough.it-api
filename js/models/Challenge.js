const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    games: Number,
    completed: Number,
    current: String,
    active: Boolean,
    public: Boolean,
    suggestions: Boolean,
    display: Object,
});

module.exports = mongoose.model('Challenge', challengeSchema);
