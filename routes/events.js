'use strict';

let express = require('express');
let google = require('googleapis');
let ModelFactory = require('../factories/modelFactory');
let Promise = require('bluebird');
let AuthUtils = require('../utils/authUtils');
let userDb = require('../dbs/userDb');
let uuid = require('node-uuid');

let router = express.Router();
let modelFactory = new ModelFactory();
let calendarApi = google.calendar("v3");

// Add Event
// Body: user
// Response: Event
router.post('/', (req, res) => {
    
    if (!req.body) {
        res.status(500).send();
        return;
    }
    
    let event = req.body;
    
    let resource = {
        colorId: "1",
        summary: event.title,
        start: {
            dateTime: event.start
        },
        end: {
            dateTime: event.end
        }
    };
    
    let auth = AuthUtils.createAuthFromSession(req.session);
    
    userDb.getByEmail(req.session.email).then(user => {
        
        return Promise.promisify(calendarApi.events.insert)({
            calendarId: user.calendar.googleCalendarId,
            resource: resource,
            auth: auth
        }).then(googleEvent => {
            return {
                googleEvent: googleEvent,
                user: user
            };
        });
    }).then(result => {
        let user = result.user;
        let googleEvent = result.googleEvent;
        
        let dbEvent = {
            id: uuid.v4(),
            privacyLevel: event.privacyLevel,
            googleEventId: googleEvent.id
        };
        
        user.calendar.events.push(dbEvent);
        
        return userDb.update(user).then(() => {
            return modelFactory.fromEventDbModel(user.calendar.googleCalendarId, dbEvent, auth);
        });
    }).then(event => {
        res.json(event);
    }).catch(err => {
        console.trace(err.stack);
        res.status(500).send();
    });
});

router.delete('/:id', (req, res) => {
    if (!req.params.id) {
        res.status(500).send();
        return;
    }
    
    userDb.getByEmail(req.session.email).then(user => {
        let dbEvent = user.calendar.events.filter(e => {
            return e.id === req.params.id;
        })[0];
        
        return Promise.promisify(calendarApi.events.delete)({
            calendarId: user.calendar.googleCalendarId,
            eventId: dbEvent.googleEventId,
            auth: AuthUtils.createAuthFromSession(req.session)
        }).then(() => {
            return user;
        });
        
    }).then(user => {
        user.calendar.events = user.calendar.events.filter(e => {
            return e.id !== req.params.id;
        });
        
        return userDb.update(user);
    }).then(() => {
        return res.json(true);
    }).catch(err => {
        console.trace(err.stack);
        return res.status(500).send();
    });
});

// Update Event
// Body: Event
// Response: Boolean
router.put('/', (req, res) => {
    
    if (!req.body) {
        res.status(500).send();
        return;
    }
    
    let event = req.body;
    
    let resource = {
        summary: event.title,
        start: {
            dateTime: event.start
        },
        end: {
            dateTime: event.end
        }
    };
    
    let auth = AuthUtils.createAuthFromSession(req.session);
    
    userDb.getByEmail(req.session.email).then(user => {
        
        let dbEvent = user.calendar.events.filter(e => {
            return e.id === event.id;
        })[0];
        
        return Promise.promisify(calendarApi.events.update)({
            calendarId: user.calendar.googleCalendarId,
            eventId: dbEvent.googleEventId,
            resource: resource,
            auth: auth
        }).then(() => {
            return {
                user: user,
                dbEvent: dbEvent
            };
        });
    }).then(result => {
        let user = result.user;
        let dbEvent = result.dbEvent;
        
        dbEvent.privacyLevel = event.privacyLevel;
        
        return userDb.update(user);
    }).then(() => {
        res.json(true);
    }).catch(err => {
        console.trace(err.stack);
        res.status(500).send();
    });
});

module.exports = router;
