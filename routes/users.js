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
router.get('/all', (req, res) => {
    userDb.getAll().then(users => {
        res.json(users)
    }, err => {
        res.json({
            error: err
        });
    });
});

router.put('/', (req, res) => {
    userDb.update(req.headers.email, req.body).then(user => {
        res.json(user) 
    }, err => {
        res.json({
          error: err
        });
    });
});

module.exports = router;