var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  privacyLevel: String,
  rsvpable: Boolean,
  googleEventId: String
});

module.exports = mongoose.model('Event', EventSchema);
