const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const numeral = require('numeraljs');

const itemSchema = new Schema({
    challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
    game: { type: Schema.Types.ObjectId, ref: 'Game' },
    status: { type: String, default: 'Unfinished' },
    time: { type: Number, set(value) { return value ? numeral(value).format('0') : undefined; } },
    completed_on: Date,
    rating: Number,
    deaths: Number,
    comment: String,
    winning: String,
});

itemSchema.plugin(require('mongoose-lifecycle'));

module.exports = mongoose.model('Item', itemSchema);
