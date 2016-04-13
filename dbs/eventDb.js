'use strict';

var BaseDb = require('./baseDb');

class EventDb extends BaseDb {
    constructor() {
        super();
        this.collectionName = "events"
    }
}

module.exports = new EventDb();
    
