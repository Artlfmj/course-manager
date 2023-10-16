// Import the mongoose library
const mongoose = require("mongoose");

// Define a schema for the course
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, // Remove whitespace from the beginning and end of the string
  },
  shortDescription: {
    type: String,
    maxLength: 30,
  },
  longDescription: {
    type: mongoose.Schema.Types.Map, // [Issue: #26][Fix] | Should contain type instead of values
    of: mongoose.Schema.Types.Mixed,
  },
  duration: {
    type: Number,
    required: true,
  },
  durationType: {
    type: String,
    enum: ["years", "months", "days",  "hours", "minutes", "seconds"],
  },
  difficulty: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  author: {
    type: String,
  },
  price: {
    type: Number
  }
  // Add more fields as needed
});

// Create a model using the schema
const Course = mongoose.model("Course", courseSchema);

// Export the Course model
module.exports = Course;
