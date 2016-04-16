'use strict'

let userDb = require('../dbs/userDb');
let express = require('express');
let router = express.Router();
let Promise = require('bluebird');

let uuid = require('node-uuid');

let google = require('googleapis');
let calendarApi = google.calendar("v3");
let oauth2Api = google.oauth2("v2");
let OAuth2 = google.auth.OAuth2;

let config = require('../config.json');
let ModelFactory = require('../factories/modelFactory');

let modelFactory = new ModelFactory();

router.get('/signin', (req, res) => {
    
    // TODO: Transform user into format that is useable by front-end
    
    authenticate(req).then(() => {
        return userDb.getByEmail(req.session.email);
    }).then(user => {
        if (user) {
            return modelFactory.fromUserDbModel(user, req.session.auth, true);
        }
        
        return constructUser(req.session.email, req.session.auth).then(user => {
            return modelFactory.fromUserDbModel(user, req.session.auth, true);
        });
    }).then(user => {
        res.json(user);
    }).catch(err => {
        return res.json({
            error: "Failed to authenticate"
        });
    });
});

function constructUser(email, auth) {
    let user = {
        accessToken: auth.credentials.access_token,
        refreshToken: auth.credentials.refresh_token,
        email: email,
        calendar: {
            events: []
        },
        friends: []
    };
    
    return Promise.promisify(oauth2Api.userinfo.get)({
        auth: auth
    }).then(userInfo => {
        user.displayName = userInfo.displayName || "";
        
        return Promise.promisify(calendarApi.calendarList.get)({
            calendarId: "primary",
            auth: auth
        });
    }).then(calendar => {
        user.calendar.googleCalendarId = calendar.id;
        user.calendar.id = uuid.v4();
        
        return Promise.promisify(calendarApi.events.list)({
            calendarId: calendar.id,
            auth: auth
        });
    }).then(events => {
        
        user.calendar.events = events.items.map(event => {
            return {
                id: uuid.v4(),
                googleEventId: event.id,
                privacyLevel: "HIDDEN",
                rsvpable: false
            };
        });
        
        return userDb.insert(user);
    });
}

function authenticate(req) {
    
    let oauth2Client = new OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
    
    // !!! This works disabling for testing purposes !!!
    
    // if (!req.headers.authorization) {
    //     return Promise.reject(new Error("Failed to authenticate"));
    // }
    
    // return new Promise((resolve, reject) => { 
    //     let code = req.headers.authorization.split(' ')[1];
        
    //     oauth2Client.getToken(code, (err, tokens) => {
    //         if (err || !tokens)  {
    //             reject(new Error("Failed to authenticate"));
    //             return;
    //         }
            
    //         oauth2Client.verifyIdToken(tokens.id_token, config.clientId, (err, login) => {
    //             if (err || !login) {
    //                 reject(new Error("Failed to authenticate"));
    //                 return;
    //             }
                
    //             req.session.email = login.getPayload().email;
                
    //             oauth2Client.setCredentials({
    //                 access_token: tokens.access_token,
    //                 refresh_token: tokens.refresh_token,
    //                 expiry_date: tokens.expiry_date
    //             });
                
    //             req.session.auth = oauth2Client;
    //             resolve();
    //         });
    //     });
    // });
    
    
    // // Pulling test user info from a config that isn't committed for testing purposes
    let user = require('../user.json');
    
    req.session.email = user.email;
    
    oauth2Client.setCredentials({
        access_token: user.accesToken,
        refresh_token: user.refreshToken,
        expiry_date: true
    });
    
    req.session.auth = oauth2Client;
    
    return Promise.resolve();
}

module.exports = router;
