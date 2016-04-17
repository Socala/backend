'use strict';

let express = require('express');
let router = express.Router();
let userDb = require('../dbs/userDb');
let ModelFactory = require('../factories/modelFactory');
let AuthUtils = require('../utils/authUtils');

let modelFactory = new ModelFactory();

// Get user
// Response: user
router.get('/', (req, res) => {
    if (!req.query.email) {
        res.status(500).send();
        return;
    }
    
    userDb.getByEmail(req.session.email).then(user => {
        if (user.email === req.query.email) {
            return "USER";
        }
        return null;
    }).then(relationship => {
        return userDb.getByEmail(req.query.email).then(user => {
            
            if (!relationship) {
                relationship = user.friends.indexOf(req.session.email) !== -1 ? "FRIEND" : "NONE";
            }
            
            return AuthUtils.createAuth(user).then(auth => {
                return modelFactory.fromUserDbModel(user, auth, relationship);
            });
        });
    }).then(user => {
        res.json(user);
    }).catch(err => {
        console.trace(err.stack);
        res.status(500).send();
    });
});

// Add Friend
// Response: User
router.get('/friends/add', (req, res) => {
    if (!req.query.email || req.session.email === req.query.email) {
        res.status(500).send();
        return;
    }
    
    userDb.addFriend(req.session.email, req.query.email)
        .then(friend => {
            
            let relationship = friend.friends.indexOf(req.session.email) !== -1 ? "FRIEND" : "NONE";
            
            return AuthUtils.createAuth(friend).then(auth => {
                return modelFactory.fromUserDbModel(friend, auth, relationship);
            });
        }).then(friend => {
            return res.json(friend);
        }).catch(err => {
            console.trace(err.stack);
            res.status(500).send();
        });
});

// Remove Friend
// Response: Boolean
router.get('/friends/remove', (req, res) => {
    if (!req.query.email || req.session.email === req.query.email) {
        res.status(500).send();
        return;
    }
    
    userDb.removeFriend(req.session.email, req.query.email)
        .then(() => {
            res.json(true);
        }).catch(err => {
            console.trace(err.stack);
            res.status(500).send();
        });
});

module.exports = router;
