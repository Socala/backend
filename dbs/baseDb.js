'use strict'

let Q = require('q');

// All collection dbs extend this base db
// Put all common queries in here for reusability
class BaseDb {
    constructor() {
        this.db = null;
        this.collection = null;
        this.collectionName = "";
    }
    
    getAll() {
        let deferred = Q.defer();
        
        this.collection.find({}).toArray((err, records) => {
            if (err) {
                deferred.reject("Failed to get all from " + collectionName);
            }
            
            deferred.resolve(records);
        });
        
        return deferred.promise;
    }
    
    setDb(db) {
        this.db = db;
        this.collection = db.collection(this.collectionName);
    }
}


module.exports = BaseDb;