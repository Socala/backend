var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/users', require('./routes/users'));
app.use('/events', require('./routes/events'));

module.exports = app;