var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var config = require('./config.json');

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
    if (!req.session.email || !req.session.auth) {
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