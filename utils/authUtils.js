'use strict';

let google = require('googleapis');
let OAuth2 = google.auth.OAuth2;
let config = require('../config.json');
let userDb = require('../dbs/userDb');
let Promise = require('bluebird');

class AuthUtils {
    static createAuthFromSession(session) {
        let auth = new OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
        
        auth.setCredentials({
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
            expiry_date: session.expiryDate || true
        });
        
        return auth;
    }

    static createAuth(user) {
        let auth = new OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
        
        auth.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.refreshToken,
            expiry_date: user.expiryDate || true
        });
        
        return new Promise((resolve, reject) => {
            
            auth.refreshAccessToken((err, tokens) => {
                if (err) {
                    reject(err);
                }
                
                user.accessToken = tokens.access_token;
                user.refreshToken = tokens.refresh_token;
                user.expiryDate = tokens.expiry_date;
                userDb.update(user);
                
                resolve(auth);
            });
        });
    }
}

module.exports = AuthUtils;