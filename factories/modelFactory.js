'use strict';

let userDb = require('../dbs/userDb');
let Promise = require('bluebird');

let google = require('googleapis');
let calendarApi = google.calendar("v3");

class ModelFactory {
    
    constructor() {
        this.colors = null;
    }
    
    getEventColor(colorId, auth) {
        if (this.colors) {
            return Promise.resolve(this.colors.event[colorId].foreground);
        }
        
        return Promise.promisify(calendarApi.colors.get)({
            auth: auth
        }).then(colors => {
            this.colors = colors;
            
            return this.colors.event[colorId].foreground;
        });
    }
    
    fromUserDbModel(dbUser, auth, enumerateFriends) {
        
        let user = {
            name: dbUser.name,
            id: dbUser.id,
            email: dbUser.email
        };
        
        
        let friendPromises = dbUser.friends.map(f => {
            return userDb.getByEmail(f);
        });
        
        // TODO: Enumerate calendars for friends, but not friends of friends
        return Promise.all(friendPromises).then(friends => {
            user.friends = friends;
            
            return this.fromCalendarDbModel(dbUser.calendar, auth);
        }).then(calendar => {
            user.calendar = calendar;
            
            return user;
        });
    }
    
    fromEventDbModel(calendarId, dbEvent, auth) {
        let event = {
            id: dbEvent.id,
            privacyLevel: dbEvent.privacyLevel,
            rsvpable: dbEvent.rsvpable,
            attendees: []
        };
        
        return Promise.promisify(calendarApi.events.get)({
            calendarId: calendarId,
            eventId: dbEvent.googleEventId,
            auth: auth
        }).then(googleEvent => {
            event.summary = googleEvent.summary;
            event.start = googleEvent.start.dateTime;
            event.end = googleEvent.end.dateTime;
            event.location = googleEvent.location;
            
            return this.getEventColor(googleEvent.colorId || 1, auth);
        }).then(color => {
            event.color = color;
            
            return event;
        });
    }
    
    fromCalendarDbModel(dbCalendar, auth) {
        let calendar =  {
            id: dbCalendar.id,
            events: []
        };
        
        let eventPromises = dbCalendar.events.map(e => {
            return this.fromEventDbModel(dbCalendar.googleCalendarId, e, auth);
        });
        
        return Promise.all(eventPromises).then(events => {
            calendar.events = events;
            
            return calendar;
        });
    }
}


module.exports = ModelFactory;