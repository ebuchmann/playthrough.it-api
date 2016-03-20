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

suite('Game Routes', function() {

    suiteSetup(function*() {
        apiPort = yield getFreePort();
        apiServer = yield startApi(apiPort);
        apiUrl = 'http://localhost:' + apiPort;
    });

    test('searching with an empty string will not work', function*() {
        const payload = {
            query: '',
        };

        const response = yield request('POST', `${apiUrl}/games/search`, { json: payload });
        const body = JSON.parse(response.body);

        assert(response.statusCode === 500 && body.errors[0] === 'Search query cannot be empty.');
    });

    test('searching with valid search terms returns some results', function*() {
        const payload = {
            query: 'Final',
        };

        const response = yield request('POST', `${apiUrl}/games/search`, { json: payload });
        const body = JSON.parse(response.body);

        assert(response.statusCode === 200 && body.length > 0);
    });

    suiteTeardown(function() {
        apiServer.close();
    });

});
