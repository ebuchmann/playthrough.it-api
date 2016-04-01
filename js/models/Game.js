const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    platform: String,
    title: String,
    genres: Array,
});

module.exports = mongoose.model('Game', gameSchema);
