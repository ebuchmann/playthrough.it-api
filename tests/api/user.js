/* global suite, suiteSetup, suiteTeardown, test */
'use strict';

const assert = require('assert');
const path = require('path');
const faker = require('faker');
const request = require('then-request');
const debug = require('debug')('play:test');

let apiPort, apiServer, apiUrl;

function getFreePort() {
    return new Promise(function(resolve, reject) {
        require('safeharbor')(function(err, available) {
            if(err) return reject(err);
            resolve(available);
        });
    });
}
function startApi(port) {
    return new Promise(function(resolve, reject) {
        try {
            const server = require(path.join(__dirname, '..', '..', 'dist', 'api.js'))
                .listen(port, function() {
                    resolve(server);
                });
        } catch(err) {
            reject(err);
        }
    });
}

suite('User Routes', function() {

    suiteSetup(function*() {
        apiPort = yield getFreePort();
        apiServer = yield startApi(apiPort);
        apiUrl = 'http://localhost:' + apiPort;
    });

    test('creating a user with an empty username should fail', function*() {
        const payload = {
            data: {
                username: '',
            },
        };

        const response = yield request('POST', `${apiUrl}/users`, { json: payload });
        const body = JSON.parse(response.body);

        assert(response.statusCode === 500 && body.errors[0] === 'Username can not be empty.');
    });

    test('usernames must be longer than 3 characters', function*() {
        const payload = {
            data: {
                username: 'who',
            },
        };

        const response = yield request('POST', `${apiUrl}/users`, { json: payload });
        const body = JSON.parse(response.body);

        assert(response.statusCode === 500 && body.errors[0] === 'Username length must be greater than 3 letters.');
    });

    test('we can create a new user', function*() {
        const payload = {
            data: {
                username: 'ebuchmann',
            },
        };

        const user = yield request('POST', apiUrl + '/users', { json: payload });

        assert(user);
    });

    suiteTeardown(function() {
        apiServer.close();
    });

});
