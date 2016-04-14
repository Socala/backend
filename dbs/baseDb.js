'use strict'

// All collection dbs extend this base db
// Put all common queries in here for reusability
class BaseDb {
    constructor() {
        this.db = null;
        this.collection = null;
        this.collectionName = "";
    }
    
    getAll() {
        let deferred = Promise.defer();
        
        this.collection.find({}).toArray((err, records) => {
            if (err) {
                deferred.reject("Failed to get all from " + collectionName);
            }
            
            deferred.resolve(records);
        });
        
        return deferred.promise;
    }
    
    get(email) {
        let deferred = Promise.defer();

        this.collection.find({ email: email }, (err, record) => {
            if (err) {
                deferred.reject("Failed to get from " + collectionName);
            }

            //Call factory method here

            deferred.resolve(record);
        });

        return deferred.promise;
    }

    update(email, reqRecord) {
        let deferred = Promise.defer();

        this.collection.update({ email: email }, {$set: reqRecord}, (err, record) => {
            if (err) {
                deferred.reject("Failed to update in " + collectionName);
            }

            //Call factory method here

            deferred.resolve(record);
        });

        return deferred.promise;
    }

    insert(reqRecord) {
        let deferred = Promise.defer();

        this.collection.find({ email: email }, (err, record) => {
            if (record) {
                deferred.reject("Identifier is not unique in " + collectionName);
            }
            else if (err) {
                deferred.reject("Failed to get from " + collectionName);
            }
        });

        this.collection.insert(reqRecord, (err, record) => {
            if (err) {
                deferred.reject("Failed to insert to " + collectionName);
            }

            //Call factory method here

            deferred.resolve(record);
        });

        return deferred.promise;
    }

    setDb(db) {
        this.db = db;
        this.collection = db.collection(this.collectionName);
    }
}


module.exports = BaseDb;
