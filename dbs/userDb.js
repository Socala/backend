'use strict';

var Q = require('q');
var BaseDb = require('./baseDb');

class UserDb extends BaseDb {
    constructor() {
        super();
        this.collectionName = "users"
    }
}

module.exports = new UserDb();
    