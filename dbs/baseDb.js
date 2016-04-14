'use strict'

let uuid = require('node-uuid');

// All collection dbs extend this base db
// Put all common queries in here for reusability
class BaseDb {
    constructor() {
        this.db = null;
        this.collection = null;
        this.collectionName = "";
    }
    
    get(props) {
        let deferred = Promise.defer();

        this.collection.findOne(props, (err, record) => {
            if (err || !record) {
                deferred.reject("Failed to find record");
                return;
            }
            
            deferred.resolve(record);
        });
        
        return deferred.promise;
        
    }
    
    getById(id) {
        let deferred = Promise.defer();

        this.collection.findOne({ id: id }, (err, record) => {
            if (err || !record) {
                deferred.reject("Failed to find record");
                return;
            }
            
            deferred.resolve(record);
        });
        
        return deferred.promise;
    }
    
    
    getAll() {
        let deferred = Promise.defer();
        
        this.collection.find({}).toArray((err, records) => {
            if (err) {
                deferred.reject("Failed to get all from " + collectionName);
                return;
            }
            
            deferred.resolve(records);
        });
        
        return deferred.promise;
    }
    
    update(item) {
        let deferred = Promise.defer();
        
        this.collection.updateOne({ id: item.id }, item, (err, record) => {
            if (err) {
                deferred.reject("Failed to update record");
                return;
            }
            
            deferred.resolve(item);
        });
        
        return deferred.promise;
    }
    
    upsert(item) {
        let deferred = Promise.defer();
        
        item.id = item.id || uuid.v4();
        
        this.collection.updateOne({ id: item.id }, item, { upsert: true }, (err, record) => {
            if (err) {
                deferred.reject("Failed to upsert record");
                return;
            }
            
            deferred.resolve(item);
        });
        
        return deferred.promise;
    }
    
    insert(item) {
        let deferred = Promise.defer();
        
        item.id = item.id || uuid.v4();
        
        this.collection.insertOne(item, (err, record) => {
            if (err) {
                deferred.reject("Failed to upsert record");
                return;
            }
            
            deferred.resolve(item);
        });
        
        return deferred.promise;
    }
    
    setDb(db) {
        this.db = db;
        this.collection = db.collection(this.collectionName);
    }
}


module.exports = BaseDb;
