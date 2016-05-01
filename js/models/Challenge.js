const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    games: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    current: { type: String, default: null },
    active: { type: Boolean, default: true },
    public: { type: Boolean, default: true },
    suggestions: { type: Boolean, default: true },
    display: { type: Object, default: { platform: true, genres: true, time: true, date: true, rating: true, deaths: true } },
});

module.exports = mongoose.model('Challenge', challengeSchema);
