const mongoose = require('mongoose');

const hashtagSchema = mongoose.Schema({
  name: String, 
  number: Number
});

const Hashtag = mongoose.model('hashtags', hashtagSchema);

module.exports = Hashtag;