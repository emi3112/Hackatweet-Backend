const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstname: String, 
  username: String,
  password: String,
  token: String,
  liked: [{ type: mongoose.Schema.Types.ObjectId, ref: "tweets" }],
  photoProfileBack : {
    type: String,
  default: null
},
  photoProfileFront : {
    type: String,
    default: null
},
  bio: {
    type: String,
    default: null
  },
  birth: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
});

const User = mongoose.model('users', userSchema);

module.exports = User;