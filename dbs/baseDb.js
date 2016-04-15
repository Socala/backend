'use strict'

let Promise = require('bluebird');
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
        return this.collection.findOneAsync(props);
    }
    
    getById(id) {
        return this.get({ id: id }); 
    }
    
    getAll() {
        return this.collection.find({}).toArrayAsync();
    }
    
    update(item) {
        return this.collection.updateOneAsync({
            id: item.id
        }, item).then(() => {
            return item;
        });
    }
    
    upsert(item) {
        item.id = item.id || uuid.v4();
        
        return this.collection.updateOneAsync({
            id: item.id
        }, item, { upsert: true }).then(() => {
            return item;
        });
    }
    
    insert(item) {
        item.id = item.id || uuid.v4();
        
        return this.collection.insertOneAsync(item).then(() => {
            return item;
        });
    }
    
    setDb(db) {
        this.db = db;
        this.collection = db.collection(this.collectionName);
    }
}


module.exports = BaseDb;
