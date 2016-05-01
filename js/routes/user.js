const route = require('koa-route');
const debug = require('debug')('play:route:user');
const fs = require('fs');
const path = require('path');
const credentials = require('../../credentials')();
const easyimg = require('easyimage');

module.exports = function (app, db) {
    const { User } = db.models;

    const removePic = file => {
        const oldFile = path.join(__dirname, '..', '..', 'public', 'profile', file);

        fs.exists(oldFile, exists => {
            if (exists) {
                fs.unlink(oldFile, err => {
                    if (err) throw err;
                });
            }
        });
    };

    /*
        PUBLIC ROUTES
    */

    /*
        PRIVATE ROUTES, REQUIRES AUTHENTICATION ON ALL ROUTES
    */

    // Updates user information
    app.use(route.post('/users/update', function *() {
        if (!this.isAuthenticated()) this.throw('You must be logged in to change your profile.', 403);
        const user = yield User.findById(this.passport.user._id);

        const fields = this.request.body.fields;
        const files = this.request.body.files;

        if (fields.img && user.profilePic) {
            removePic(user.profilePic.split('/').pop());
            user.set('profilePic', null);
        }

        if (files.img) {
            if (user.profilePic) removePic(user.profilePic.split('/').pop());

            const fileName = `${user._id}_${Math.random()}.jpg`;
            const newFile = path.join(__dirname, '..', '..', 'public', 'profile', fileName);

            yield easyimg.crop({
                src: files.img.path,
                dst: newFile,
                // width: 450,
                // height: 450,
                cropwidth: 450,
                cropheight: 450,
                fill: true,
                // x: 0,
                // y: 0,
            });

            fs.unlink(files.img.path, err => {
                if (err) throw err;
            });

            const filePath = `${credentials.url}/profile/${newFile.split('\\').pop()}`;
            user.set('profilePic', filePath);
        }

        if (fields.username !== user.username) {
            user.set('username', fields.username);
            // TODO: un-comment this, we only want people to change names once
            // if (data.username) {
            //     user.set('canChangeName', undefined);
            // }
        }

        if (fields.email !== user.email) {
            user.set('email', fields.email);
            // TODO: set it to un-verified and send out an email
        }

        user.set('viewAds', fields.viewAds);

        this.status = 201;
        this.body = {
            type: 'users',
            attributes: yield user.save(),
        };
    }));

    // Fetches currently logged in user
    app.use(route.get('/users/current', function*() {
        this.status = 200;
        if (this.isAuthenticated()) this.body = this.passport.user;
        else this.body = false;
    }));
};
