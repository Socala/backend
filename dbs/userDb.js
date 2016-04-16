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
    
    addFriend(userEmail, friendEmail) {
        return this.getByEmail(userEmail).then(user => {
            if (user.friends.indexOf(friendEmail) !== -1) {
                return Promise.reject(new Error("User already has friend"));
            }
            
            return this.getByEmail(friendEmail).then(friend => {
                return {
                    user: user,
                    friend: friend
                };
            });
        }).then(users => {
            let user = users.user;
            let friend = users.friend;
            
            if (!friend) {
                return Promise.reject(new Error("User does not exist"));
            }
        
            user.friends.push(friendEmail);
            
            return this.update(user).then(() => {
                return friend;
            });
        });
    }
    
    removeFriend(userEmail, friendEmail) {
        return this.getByEmail(userEmail).then(user => {
            if (user.friends.indexOf(friendEmail) === -1) {
                return Promise.reject(new Error("User does not have friend"));
            }
            
            user.friends = user.friends.filter(e => {
                return e !== friendEmail;
            });
            
            return this.update(user);
        });
    }
}

module.exports = new UserDb();
    
