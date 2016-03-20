// Update with your config settings.
// TODO: Make sure this file gets used in your db.js file, keep it DRY

const credentials = require('./credentials')();

module.exports = {

    development: {
        client: 'pg',
        connection: credentials.connection,
        migrations: {
            tableName: 'knex_migrations',
        },
        debug: true,
    },

    test: {
        client: 'pg',
        connection: credentials.connection,
        migrations: {
            tableName: 'knex_migrations',
        },
    },

    staging: {
        client: 'pg',
        connection: credentials.connection,
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },

    production: {
        client: 'pg',
        connection: credentials.connection,
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },

};
