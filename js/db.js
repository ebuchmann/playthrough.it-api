'use strict';
const mongoose = require('mongoose');
const debug = require('debug')('play:db');

let _cs;
let _connection;

module.exports = function db(credentials) {
    const cs = credentials.mongo.connectionString;

    if (!cs) {
        if (_connection) return _connection;
        throw new Error('must specify connection string', 400);
    }
    // if there's already a connection for this connection string, return it
    if (cs === _cs && _connection) return _connection;

    // cache the connection string
    _cs = cs;
    debug(`creating mongoose connection to ${_cs.replace(/(mongodb:\/\/\w+:)(\w+)@/, '$1*****@$\'')}`);
    // connect
    mongoose.connect(_cs, {
        server: {
            socketOptions: {
                keepAlive: 1,
            },
        },
    });
    // cache the connection
    _connection = mongoose.connection;

    _connection.on('connected', () => {
        debug('database connected');
    });
    _connection.on('close', () => {
        debug('database connection closed');
    });
    _connection.on('error', err => {
        debug('database error: %o', err);
    });

    return _connection;
};
