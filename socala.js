var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/socala');
var User = require('./models/user');
var Event = require('./models/event');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var router = express.Router();              // get an instance of the express Router

// routes that end in /user
//-----------------------------------------

router.post('/user', function(req, res) {
  var user = new User();
  user.username = req.body.username;
  user.oAuthToken = req.body.oAuthToken;
  user.email = req.body.email;
  user.calendar = req.body.calendar;
  user.friends = req.body.friends;

  user.save(function(err) {
    if(err)
      res.send(err);

    res.json(user);
  });
});

router.get('/user', function(req, res) {
  User.find(function(err, users) {
    if (err)
      res.send(err);
    res.json(users);
  });
});

// routes that end in /user/:user_id
//-----------------------------------------

router.get('/user/:user_id', function(req, res) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
});

// This needs to return a boolean, so I made it return false instead of err in
// case of error, since client could mistakenly evaluate a nonzero err as true
router.put('/user/:user_id', function(req, res) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.send(false);
    
    user.username = req.body.username;
    user.oAuthToken = req.body.oAuthToken;
    user.email = req.body.email;
    user.calendar = req.body.calendar;
    user.friends = req.body.friends;
    
    user.save(function(err) {
      if (err)
        res.send(false);

      res.send(true);
    });
  });
});

// Returns boolean like above
router.delete('/user/:user_id', function(req, res) {
  User.remove({ _id: req.params.user_id }, function(err, user) {
    if (err)
      res.send(false);

    res.send(true);
  });
});

// routes that end in /event
//-----------------------------------------

router.post('/event', function(req, res) {
  var event = new Event();
  event.googleEventId = req.body.googleEventId;
  event.privacyLevel = req.body.privacyLevel;
  event.rsvpable = req.body.rsvpable;

  event.save(function(err) {
    if(err)
      res.send(err);

    res.json(event);
  });
});

router.get('/event', function(req, res) {
  Event.find(function(err, events) {
    if (err)
      res.send(err);
    res.json(events);
  });
});

// routes that end in /event/:event_id
//-----------------------------------------

router.get('/event/:event_id', function(req, res) {
  Event.findById(req.params.event_id, function(err, event) {
    if (err)
      res.send(err);
    res.json(event);
  });
});

// This needs to return a boolean, so I made it return false instead of err in
// case of error, since client could mistakenly evaluate a nonzero err as true
router.put('/event/:event_id', function(req, res) {
  Event.findById(req.params.event_id, function(err, event) {
    if (err)
      res.send(false);

    event.googleEventId = req.body.googleEventId;
    event.privacyLevel = req.body.privacyLevel;
    event.rsvpable = req.body.rsvpable;
    
    event.save(function(err) {
      if (err)
        res.send(false);

      res.send(true);
    });
  });
});

// Returns boolean like above
router.delete('/event/:event_id', function(req, res) {
  Event.remove({ _id: req.params.event_id }, function(err, event) {
    if (err)
      res.send(false);

    res.send(true);
  });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /socala
app.use('/socala', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
