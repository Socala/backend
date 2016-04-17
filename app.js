'use strict';

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let config = require('./config.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false
}));

app.use('/users', require('./routes/signIn'));

// This middleware requires a user to be authenticated before allowing access to the rest of the api
app.use((req, res,next) => {
    if (!req.session.email) {
        res.json({
            error: "User not authenticated"
        });
        
        return;
    }
    
    next();
});

app.use('/users', require('./routes/users'));
app.use('/events', require('./routes/events'));

app.use((req, res) => {
    res.json("");
});

module.exports = app;