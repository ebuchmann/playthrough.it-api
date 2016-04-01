const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    type: String,
    message: String,
    user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Activity', activitySchema);
