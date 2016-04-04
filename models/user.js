var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: String,
  oAuthToken: String,
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  calendar: {
    events: [String],
    googleCalendarId: String
  },
  friends: [String]
});

module.exports = mongoose.model('User', UserSchema);
