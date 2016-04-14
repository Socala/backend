'use strict';

var BaseDb = require('./baseDb');

class UserDb extends BaseDb {
    constructor() {
        super();
        this.collectionName = "users"
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

}

module.exports = new UserDb();
    
