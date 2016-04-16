'use strict';

let userDb = require('../dbs/userDb');
let Promise = require('bluebird');

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
        
        enumerateFriends = !!enumerateFriends;
        
        let user = {
            displayName: dbUser.displayName,
            id: dbUser.id,
            email: dbUser.email
        };
        
        if (!enumerateFriends) {
            user.friends = [];
            
            return this.fromCalendarDbModel(dbUser.calendar, auth).then(calendar => {
                user.calendar = calendar;
                
                return user;
            });
        }
        
        let friendPromises = dbUser.friends.map(f => {
            return userDb.getByEmail(f).then(f => {
                let auth = new OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
                
                auth.setCredentials({
                    access_token: f.accessToken,
                    refresh_token: f.refreshToken,
                    expiry_date: f.expiry_date
                });
                
                return this.fromUserDbModel(f, auth, false);
            });
        });
        
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
            attendees: [],
            hasRecurrence: false
        };
        
        return Promise.promisify(calendarApi.events.get)({
            calendarId: calendarId,
            eventId: dbEvent.googleEventId,
            auth: auth
        }).then(googleEvent => {
            event.summary = googleEvent.summary;
            
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
    
    fromCalendarDbModel(dbCalendar, auth) {
        let calendar =  {
            id: dbCalendar.id,
            events: []
        };
        
        let eventPromises = dbCalendar.events.map(e => {
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
        function pad(n){return n<10 ? '0'+n : n}
        return d.getUTCFullYear()+'-'
            + pad(d.getUTCMonth()+1)+'-'
            + pad(d.getUTCDate())+'T'
            + pad(d.getUTCHours())+':'
            + pad(d.getUTCMinutes())+":"
            + pad(d.getUTCSeconds())
            + "-00:00";
    }
}


module.exports = ModelFactory;