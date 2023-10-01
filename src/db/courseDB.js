// Import the mongoose library
const mongoose = require('mongoose');

// Define a schema for the course
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, // Remove whitespace from the beginning and end of the string
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true, 
  },
  // Add more fields as needed
});

// Create a model using the schema
const Course = mongoose.model('Course', courseSchema);

// Export the Course model
module.exports = Course;
