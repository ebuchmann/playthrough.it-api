const env = process.env.NODE_ENV || 'development';
const Mongorito = require('mongorito');
const Model = Mongorito.Model;
Mongorito.connect('localhost');

module.exports = Model;
