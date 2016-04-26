'use strict';

let userDb = require('../dbs/userDb');
let express = require('express');
let router = express.Router();
let Promise = require('bluebird');
let AuthUtils = require('../utils/authUtils');

let uuid = require('node-uuid');

let google = require('googleapis');
let OAuth2 = google.auth.OAuth2;
let calendarApi = google.calendar("v3");
let oauth2Api = google.oauth2("v2");

let config = require('../config.json');
let ModelFactory = require('../factories/modelFactory');

let modelFactory = new ModelFactory();

router.get('/signin', (req, res) => {
    
    authenticate(req).then(() => {
        return userDb.getByEmail(req.session.email);
    }).then(user => {
        let auth = AuthUtils.createAuthFromSession(req.session);
        
        if (user) {
            return modelFactory.fromUserDbModel(user, auth, "USER");
        }
        
        return constructUser(req.session.email, auth).then(user => {
            return modelFactory.fromUserDbModel(user, auth, "USER");
        });
    }).then(user => {
        res.json(user);
    }).catch(err => {
        console.trace(err.stack);
        return res.status(500).send();
    });
});

function constructUser(email, auth) {
    let user = {
        accessToken: auth.credentials.access_token,
        refreshToken: auth.credentials.refresh_token,
        expiryDate: auth.credentials.expiry_date,
        email: email,
        calendar: {
            events: []
        },
        friends: []
    };
    
    return Promise.promisify(oauth2Api.userinfo.get)({
        auth: auth
    }).then(userInfo => {
        user.displayName = userInfo.name || "";
        
        user.calendar.googleCalendarId = "primary";
        user.calendar.id = uuid.v4();
        
        var timeMin = new Date();
        timeMin.setMonth(timeMin.getMonth() - 3);
        
        return Promise.promisify(calendarApi.events.list)({
            calendarId: "primary",
            timeMin: modelFactory.toRFC3339(timeMin),
            auth: auth
        });
    }).then(events => {
        user.calendar.events = events.items.map(modelFactory.toDbEvent);
        
        return userDb.insert(user);
    });
}

function authenticate(req) {
    
    let oauth2Client = new OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
    
    if (!req.headers.authorization) {
        return Promise.reject(new Error("Failed to authenticate"));
    }
    
    return new Promise((resolve, reject) => { 
        let code = req.headers.authorization.split(' ')[1];
        
        oauth2Client.getToken(code, (err, tokens) => {
            if (err || !tokens)  {
                reject(new Error("Failed to authenticate"));
                return;
            }
            
            oauth2Client.verifyIdToken(tokens.id_token, config.clientId, (err, login) => {
                if (err || !login) {
                    reject(new Error("Failed to authenticate"));
                    return;
                }
                
                req.session.email = login.getPayload().email;
                req.session.accessToken = tokens.access_token;
                req.session.refreshToken = tokens.refresh_token;
                req.session.expiryDate = tokens.expiry_date;
                
                resolve();
            });
        });
    });
}

module.exports = router;