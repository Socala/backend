'use strict';

let express = require('express');
let router = express.Router();
let userDb = require('../dbs/userDb');
let ModelFactory = require('../factories/modelFactory');
let google = require('googleapis');
let OAuth2 = google.auth.OAuth2;

let config = require('../config.json');

let modelFactory = new ModelFactory();


// How to use google calendar API: https://developers.google.com/google-apps/calendar/quickstart/nodejs#step_3_set_up_the_sample

// Follow this example for creating routes

// NOTE: You will have to transform the resources pulled from the database into a format used by the front-end
// For example, removing the google calendar api ids and enumerating the properties by making a call to the google calendar api
// I would make a factory for this!
// The factory would work by taking in a user from the db, make calls to the google calendar api, construct a front-end usable user and then return this new user object

// This one is just here for our testing purposes
router.get('/all', (req, res) => {
    userDb.getAll().then(users => {
        res.json(users);
    }, err => {
        res.json({
            error: err
        });
    });
});

// Get user
// Response: user
router.get('/', (req, res) => {
    if (!req.query.email) {
        res.json({
            error: "No email provided"
        });
        return;
    }
    
    userDb.getByEmail(req.query.email).then(user => {
        return modelFactory.fromUserDbModel(user, createAuth(user), false);
    }).then(user => {
        res.json(user);
    }).catch(err => {
        res.json({
            error: err
        });
    });
});

// Update user
// Body: user
// Response: Boolean
router.put('/', (req, res) => {
    userDb.update(req.body).then(result => {
        res.json({
            status: true
        });
    }, err => {
        res.json({
            status: false
        });
    });
});

// Add Friend
// Response: User
router.get('/friends/add', (req, res) => {
    if (!req.query.email) {
        res.json({
            error: "Failed to add friend: No email provided"
        });
        
        return;
    } else if (req.session.email === req.query.email) {
        res.json({
            error: "Cannot add yourself!"
        });
        
        return;
    }
    
    userDb.addFriend(req.session.email, req.query.email)
        .then(friend => {
            return modelFactory.fromUserDbModel(friend, createAuth(friend), false);
        }).then(friend => {
            return res.json(friend);
        }).catch(err => {
            res.json({
                error: err
            });
        });
});

// Remove Friend
// Response: Boolean
router.get('/friends/remove', (req, res) => {
    if (!req.query.email) {
        res.json({
            error: "Failed to remove friend: No email provided"
        });
        
        return;
    } else if (req.session.email === req.query.email) {
        res.json({
            error: "Cannot remove yourself!"
        });
        
        return;
    }
    
    userDb.removeFriend(req.session.email, req.query.email)
        .then(() => {
            res.json({
                status: true
            });
        }).catch(err => {
            res.json({
                status: false
            });
        });
});

function createAuth(user) {
    let auth = new OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
    
    auth.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
        expiry_date: user.expiry_date || true
    });
    
    return auth;
}

module.exports = router;
