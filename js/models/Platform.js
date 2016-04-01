const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const platformSchema = new Schema({
    title: String,
});

module.exports = mongoose.model('Platform', platformSchema);
