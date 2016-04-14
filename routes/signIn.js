'use strict'

let userDb = require('../dbs/userDb');
let express = require('express');
let router = express.Router();

let google = require('googleapis');
let config = require('../config.json');
let OAuth2 = google.auth.OAuth2;
let oauth2Client = new OAuth2(config.clientId, config.clientSecret, config.redirectUrl, "");

router.get('/signin', (req, res) => {
    
    // TODO: 
    // A user record should be created if not found
    // Initialize the new record by first getting their calendar from google calendar api
    // Save the new record into the database, then transform it into a format usable by the front-end
    
    authenticate(req).then(() => {
        return userDb.getByEmail(req.session.email);
    }).then(user => {
        res.json(user);
    }, err => {
        res.json({
            error: err
        });
    });
});

function authenticate(req) {
    var deferred = Promise.defer();
    
    // !!! This works disabling for testing purposes !!!
    
    // if (!req.headers.authorization) {
    //     deferred.reject("Failed to authenticate");
    // }
    
    // var code = req.headers.authorization.split(' ')[1];
    
    // oauth2Client.getToken(code, (err, tokens) => {
    //     if (err || !tokens)  {
    //         deferred.reject("Failed to authenticate");
    //         return;
    //     }
        
    //     req.session.expiryDate = tokens.expiry_date;
    //     req.session.accessToken = tokens.access_token;
    //     req.session.refreshToken = tokens.refresh_token;
        
    //     oauth2Client.verifyIdToken(tokens.id_token, config.clientId, (err, login) => {
    //         if (err || !login) {
    //             deferred.reject("Failed to authenticate");
    //             return;
    //         }
            
    //         req.session.email = login.getPayload().email;
    //         deferred.resolve();
    //     });
    // });
    
    req.session.email = "bromano@crimson.ua.edu";
    deferred.resolve();
    
    return deferred.promise;
}

module.exports = router;
