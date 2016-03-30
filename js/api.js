const koa = require('koa');
const path = require('path');
const debug = require('debug')('play:api');
const views = require('koa-render');
const route = require('koa-route');
// const chalk = require('chalk');

const port = process.env.PORT || 3033;
const env = process.env.NODE_ENV || 'development';
const credentials = require('../credentials')(env);
// const mailgun = require('mailgun-js')({ apiKey: credentials.mailgun.apiKey, domain: credentials.mailgun.domain });
// mailgun.messages().send({
//     from: 'Admin <admin@playthrough.it>',
//     to: 'me@ebuchmann.com',
//     subject: 'test',
//     text: 'body copy',
// }, (err, body) => {
//     debug(body);
// });

// TODO: Get a working ENV set up - 'Dev', 'Staging', 'Prod'

const app = koa();
const db = require(path.join(__dirname, 'db.js'));

app.use(require('koa-body')());
app.use(require('koa-session')(app));

// app.use(require('koa-cors')({
//     origin : '*',
//     methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
//     headers: ['Access-Control-Allow-Origin', '*'],
// }));

app.use(views('./public', {
    map: {
        html: 'handlebars',
    },
}));

// Catch all errors
app.use(function *(next) {
    try {
        yield next;
    } catch (err) {
        this.status = err.status;
        this.body = {
            error: err.message,
        };
    }
});

app.use(route.get('/test', function*() {
    debug('test');
    this.body = yield this.render('test');
    // this.body = { true: 'yes' };
}));

app.use(function*(next){
    this.set('Access-Control-Allow-Origin', 'http://localhost:8080');
    this.set('Access-Control-Allow-Credentials', true);
    this.set('Access-Control-Allow-Methods', 'PUT,POST,PATCH,GET,OPTIONS,DELETE,HEAD');
    this.set('Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials, Access-Control-Allow-Origin, Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    yield next;
});

app.use(route.options('*', function*() {
    this.status = 201;
    return;
}));

app.keys = ['your-session-secret'];

// TODO: Find a better way to include all Models / Routes, keep it DRY

// Models
require(path.join(__dirname, 'models', 'Platform.js'))(db);
require(path.join(__dirname, 'models', 'Game.js'))(db);
require(path.join(__dirname, 'models', 'User.js'))(db);
require(path.join(__dirname, 'models', 'Collection.js'))(db);
require(path.join(__dirname, 'models', 'Item.js'))(db);
require(path.join(__dirname, 'models', 'Suggestion.js'))(db);
require(path.join(__dirname, 'models', 'Activity.js'))(db);

// Auth
require(path.join(__dirname, '.', 'auth.js'))(app, db);

// Routes
require(path.join(__dirname, 'routes', 'collection.js'))(app, db);
require(path.join(__dirname, 'routes', 'game.js'))(app, db);
require(path.join(__dirname, 'routes', 'item.js'))(app, db);
require(path.join(__dirname, 'routes', 'user.js'))(app, db);
require(path.join(__dirname, 'routes', 'suggestion.js'))(app, db);
require(path.join(__dirname, 'routes', 'activity.js'))(app, db);

// Start up the API
if (require.main === module) { // Not a module, starts the API
    app.listen(port, function() {
        debug(`API started on port: ${port}`);
    });
} else { // For testing we return this as a module
    module.exports = app;
}
