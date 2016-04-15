'use strict';
let express = require('express');
let router = express.Router();
let userDb = require('../dbs/userDb');

// How to use google calendar API: https://developers.google.com/google-apps/calendar/quickstart/nodejs#step_3_set_up_the_sample

// router.use('/', (req, res, next) =>
//   // Get email from Google API using oAuthToken
// );

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

// Add user
// Body: user
// Response: user
router.post('/', (req, res) => {
    userDb.insert(req.body).then(userDb.getByEmail(req.body.email)).then(user => {
        res.json(user);
    }, err => {
        res.json({
          error: err
        });
    });
});

// Get user
// Response: user
router.get('/', (req, res) => {
    userDb.getByEmail(req.session.email).then(user => {
        res.json(user);
    }, err => {
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
router.get('/friend/add?:email', (req, res) => {
    userDb.getByEmail(req.params).then(friend => {
        if (!friend) {
            res.json({
                error: "Failed to add friend: No such user"
            });
        } else {
            userDb.push({email: req.session.email}, {friends: friend.email})
		.then(userDb.getByEmail(req.session.email)).then(user => { 
                    res.json(user);
                }, err => {
                    res.json({
                        error: err
                    });
		});
        }
    }, err => {
        res.json({
	    error: err
        });
    });
});

// Remove Friend
// Response: Boolean
router.get('/friend/remove?:email', (req, res) => {
    userDb.pull({email: req.session.email}, {friends: friend.email}).then(result => {
	userDb.getByEmail(req.session.email)).then(user => { 
            res.json({
		    status: true
                });
            }, err => {
                res.json({
			status: false
                });
            });
        }
    }, err => {
        res.json({
		status: false:
        });
    });
});

module.exports = router;
