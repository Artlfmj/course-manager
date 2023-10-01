const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the user schema
const userSchema = new mongoose.Schema({
  // Basic user information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
  },
  bio: {
    type: String,
  },
  location: {
    type: String,
  },
  website: {
    type: String,
  },

  // User roles or permissions (if needed)
  roles: [
    {
      type: String,
      enum: ['user', 'admin'], // Customize roles as needed
      default: 'user',
    },
  ],

  // Timestamps for user creation and updates
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
