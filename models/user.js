const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'cannot be blank'],
  },
  password: {
    type: String,
    required: [true, 'password required cannot be blank'],
  },
});
