
'use strict';

let Promise = require('bluebird');
let MongoDB = require('mongodb');
Promise.promisifyAll(MongoDB);

let mongoClient = MongoDB.MongoClient;

let userDb = require('./userDb');
let eventDb = require('./eventDb');
let config = require('../dbConfig.json');

function DbContext() {
    this.db = null;
}

// Initialize mongo connection
DbContext.prototype.start = function() {
    return mongoClient.connectAsync(config.url).then(db => {
        this.db = db;
        userDb.setDb(this.db);
    }, err => {
        Promise.reject("Could not connect");
    }); 
};

let dbContext = new DbContext();

module.exports = dbContext;
