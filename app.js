var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var config = require('./config.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Using session storage to store google api access token once retrieved
// This allows the front-end to only have to give the auth code once
// To access the stored session use req.session
// The req.session will look like:
// { expiryDate: "", refreshToken: "", accessToken: "", email: "" }
// To make calls to the google calendar api you will want to pull the accesstoken from the session
// The session is initialized when the user uses the signIn endpoint

// READ THIS!!!!!!!
// You will need to generate an accessToken to make request calendar resources.
// You will need to setup a project in google dev console and either use the android app to generate an access code, then use the signIn endpoint to generate an access Token
// Or you can use oauth2 playground to generate an accessToken with the required scopes (Calendar API)
// Once you have an access token you will need to add it to the session somewhere in the code (most likely the signIn endpoint). 
// Use this code: req.session.accessToken = "The access token you created";

app.use(cookieParser());
app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false
}));

app.use('/users', require('./routes/signIn'));

// This middleware requires a user to be authenticated before allowing access to the rest of the api
app.use((req, res,next) => {
    if (!req.session.email || req.session.accessToken) {
        res.json({
            error: "User not authenticated"
        });
        
        return;
    }
    
    next();
});

app.use('/users', require('./routes/users'));
app.use('/events', require('./routes/events'));

module.exports = app;