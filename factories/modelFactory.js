'use strict';

let userDb = require('../dbs/userDb');
let Promise = require('bluebird');
let AuthUtils = require('../utils/authUtils');

let google = require('googleapis');
let OAuth2 = google.auth.OAuth2;
let calendarApi = google.calendar("v3");
let config = require('../config.json');

// TODO: Filter events based on current user's relationship
class ModelFactory {
    
    constructor() {
        this.colors = null;
    }
    
    getEventColor(colorId, auth) {
        if (this.colors) {
            return Promise.resolve(this.colors.event[colorId].background);
        }
        
        return Promise.promisify(calendarApi.colors.get)({
            auth: auth
        }).then(colors => {
            this.colors = colors;
            
            return this.colors.event[colorId].background;
        });
    }
    
    fromUserDbModel(dbUser, auth, relationship) {
        
        if (!relationship) {
            relationship = "USER";
        }
        
        let user = {
            displayName: dbUser.displayName,
            id: dbUser.id,
            email: dbUser.email
        };
        
        if (relationship !== "USER") {
            user.friends = [];
            
            return this.fromCalendarDbModel(dbUser.calendar, auth, relationship).then(calendar => {
                user.calendar = calendar;
                
                return user;
            });
        }
        
        let friendPromises = dbUser.friends.map(f => {
            return userDb.getByEmail(f).then(f => {
                return AuthUtils.createAuth(f).then(auth => {
                    return this.fromUserDbModel(f, auth, "FRIEND");
                });
            });
        });
        
        return Promise.all(friendPromises).then(friends => {
            user.friends = friends;
            
            return this.fromCalendarDbModel(dbUser.calendar, auth, relationship);
        }).then(calendar => {
            user.calendar = calendar;
            
            return user;
        });
    }
    
    fromEventDbModel(calendarId, dbEvent, auth) {
        let event = {
            id: dbEvent.id,
            privacyLevel: dbEvent.privacyLevel,
            hasRecurrence: false
        };
        
        return Promise.promisify(calendarApi.events.get)({
            calendarId: calendarId,
            eventId: dbEvent.googleEventId,
            auth: auth
        }).then(googleEvent => {
            event.title = googleEvent.summary;
            
            // TODO: Adjust to user's time zone
            if (!googleEvent.start.dateTime) {
                event.start = this.toRFC3339(new Date(googleEvent.start.date));
                event.end = this.toRFC3339(new Date(googleEvent.end.date));
            } else {
                event.start = googleEvent.start.dateTime;
                event.end = googleEvent.end.dateTime;
            }
            
            event.location = googleEvent.location;
            // Re-add recurring events once this is figured out
            event.hasRecurrence = !!googleEvent.recurrence;
            
            return this.getEventColor(googleEvent.colorId || 1, auth);
        }).then(color => {
            event.color = color;
            
            return event;
        });
    }
    
    fromCalendarDbModel(dbCalendar, auth, relationship) {
        
        if (!relationship) {
            relationship = "USER";
        }
        
        let calendar =  {
            id: dbCalendar.id,
            events: []
        };
        
        let eventPromises = dbCalendar.events.filter(e => {
            return relationship === "USER" || 
                e.privacyLevel === "PUBLIC" ||
                (e.privacyLevel === "FRIENDS" && relationship === "FRIEND");
        }).map(e => {
            return this.fromEventDbModel(dbCalendar.googleCalendarId, e, auth);
        });
        
        return Promise.all(eventPromises).then(events => {
            calendar.events = events.filter(e => !e.hasRecurrence).map(e => {
                delete e.hasRecurrence;
                return e;
            });
            
            return calendar;
        });
    }
    
    toRFC3339(d) {
        function pad(n){return n<10 ? '0'+n : n; }
        return d.getUTCFullYear()+'-' +
            pad(d.getUTCMonth()+1)+'-' +
            pad(d.getUTCDate())+'T' +
            pad(d.getUTCHours())+':' +
            pad(d.getUTCMinutes())+":" +
            pad(d.getUTCSeconds()) +
            "-00:00";
    }
}


module.exports = ModelFactory;