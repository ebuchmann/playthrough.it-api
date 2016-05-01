const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    twitter: String,
    email: String,
    profilePic: String,
    canChangeName: { type: Boolean, default: true },
    maxChallenges: { type: Number, default: 5 },
    viewAds: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
