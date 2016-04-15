
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
    // let deferred = Promise.defer();
    
    return mongoClient.connectAsync(config.url).then(db => {
        this.db = db;
        userDb.setDb(this.db);
        // deferred.resolve();
    }, err => {
        Promise.reject("Could not connect");
    }); 
    
    
    // (err, db) => {
    //     if (err) {
    //         deferred.reject("Could not connect");
    //     }
        
    //     this.db = db;
        
    //     // Attach db instance to all collection-specific databases
    //     userDb.setDb(this.db);
    //     deferred.resolve();
    // });
    
    // return deferred.promise;
};

let dbContext = new DbContext();

module.exports = dbContext;
