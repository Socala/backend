
var MongoClient = require('mongodb').MongoClient;
var userDb = require('./userDb');
var config = require('../dbConfig.json');

function DbContext() {
    this.db = null;
}

// Initialize mongo connection
DbContext.prototype.start = function() {
    var deferred = Promise.defer();
    
    MongoClient.connect(config.url, (err, db) => {
        if (err) {
            deferred.reject("Could not connect");
        }
        
        this.db = db;
        
        // Attach db instance to all collection-specific databases
        userDb.setDb(this.db);
        deferred.resolve();
    });
    
    return deferred.promise;
};

var dbContext = new DbContext();

module.exports = dbContext;
