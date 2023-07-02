const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  firstname: String, 
  username: String,
  date: String,
  text: String,
  likes: Number,
  whoLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  gif: Object,
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;