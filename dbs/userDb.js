'use strict';

var BaseDb = require('./baseDb');

class UserDb extends BaseDb {
    constructor() {
        super();
        this.collectionName = "users"
    }

    getByEmail(email) {
        return this.get({
            email: email
        });
    }
    
}

module.exports = new UserDb();
    
