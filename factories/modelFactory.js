'use strict';

let userDb = require('../dbs/userDb');
let Promise = require('bluebird');
let AuthUtils = require('../utils/authUtils');

let google = require('googleapis');
let OAuth2 = google.auth.OAuth2;
let calendarApi = google.calendar("v3");
let config = require('../config.json');
let uuid = require('node-uuid');

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

    getColorId(color, auth) {
        if (this.colors) {
            for (let colorId in this.colors.event) {
                if (this.colors.event[colorId].background === color) {
                    return new Promise.resolve(colorId);
                }
            }
            
            return new Promise.reject(new Error("Failed to get color"));
        }

        return Promise.promisify(calendarApi.colors.get)({
            auth: auth
        }).then(colors => {
            this.colors = colors;

            for (let colorId in this.colors.event) {
                if (this.colors.event[colorId].background === color) {
                    return new Promise.resolve(colorId);
                }
            }
            
            return new Promise.reject(new Error("Failed to get color"));
        });
    }

    fromUserDbModel(dbUser, auth, relationship) {

        relationship = relationship || "USER";

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

        let dbUsers = dbUser.friends.map(f => userDb.getByEmail(f));

        let friendPromises = Promise.map(dbUsers, f => {
            return AuthUtils.createAuth(f)
                .then(auth => this.fromUserDbModel(f, auth, "FRIEND"));
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
        return Promise.promisify(calendarApi.events.get)({
            calendarId: calendarId,
            eventId: dbEvent.googleEventId,
            auth: auth
        }).then(c => {
            return this.toSocalaEvent(c, dbEvent, auth);
        });
    }

    toSocalaEvent(googleEvent, dbEvent, auth) {
        let event = {
            id: dbEvent.id,
            privacyLevel: dbEvent.privacyLevel,
            hasRecurrence: false
        };

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

        return this.getEventColor(googleEvent.colorId || 1, auth).then(c => {
            event.color = c;
            return event;
        });
    }

    toDbEvent(googleEvent) {
        return {
            id: uuid.v4(),
            googleEventId: googleEvent.id,
            privacyLevel: "HIDDEN"
        };
    }

    fromCalendarDbModel(dbCalendar, auth, relationship) {

        relationship = relationship || "USER";

        let calendar = {
            id: dbCalendar.id,
            events: []
        };

        let dbEvents = dbCalendar.events
            .filter(e => this.canViewEvent(e, relationship));

        let timeMin = new Date();
        timeMin.setMonth(timeMin.getMonth() - 3);

        return Promise.promisify(calendarApi.events.list)({
            calendarId: "primary",
            timeMin: this.toRFC3339(timeMin),
            auth: auth
        }).then(googleCalendar => {

            let eventPromises = googleCalendar.items
                .map(e => {
                    let dbEvent = dbEvents.filter(dbEvent => dbEvent.googleEventId === e.id)[0];

                    if (!dbEvent) {
                        return null;
                    }

                    return this.toSocalaEvent(e, dbEvent, auth);
                })
                .filter(e => e);

            return Promise.all(eventPromises).then(events => {
                calendar.events = events;
                return calendar;
            });
        });
    }

    canViewEvent(event, relationship) {
        return relationship === "USER" ||
            event.privacyLevel === "PUBLIC" ||
            (event.privacyLevel === "FRIENDS" && relationship === "FRIEND");
    }

    toRFC3339(d) {
        function pad(n) { return n < 10 ? '0' + n : n; }
        return d.getUTCFullYear() + '-' +
            pad(d.getUTCMonth() + 1) + '-' +
            pad(d.getUTCDate()) + 'T' +
            pad(d.getUTCHours()) + ':' +
            pad(d.getUTCMinutes()) + ":" +
            pad(d.getUTCSeconds()) +
            "-00:00";
    }
}


module.exports = ModelFactory;