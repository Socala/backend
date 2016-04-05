var express = require('express');
var router = express.Router();
var userDb = require('../dbs/userDb');

// Follow this example for creating routes

// NOTE: You will have to transform the resources pulled from the database into a format used by the front-end
// For example, removing the google calendar api ids and enumerating the properties by making a call to the google calendar api
// I would make a factory for this!
// The factory would work by taking in a user from the db, make calls to the google calendar api, construct a front-end usable user and then return this new user object
router.get('/', function(req, res) {
    userDb.getAll().then((users) => {
        res.json({
            users: users
        });
    }, (err) => {
        res.json({
            error: err
        });
    });
});

module.exports = router;