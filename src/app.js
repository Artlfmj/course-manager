const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();

// Read configuration from config.json
let config;
try {
  const configData = fs.readFileSync('config.json');
  config = JSON.parse(configData);
} catch (err) {
  console.error('Error reading config file:', err);
  process.exit(1);
}

// Connect to MongoDB using the configuration
mongoose.connect(config.mongodb_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    // Start your application logic here
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Simulated user data (replace with actual user data from your database)
const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
];

// Define your login function here
function login(username, password) {
  const user = users.find((u) => u.username === username && u.password === password);
  return !!user; // Return true if the user exists, false otherwise
}

// Example usage of the login function
app.get('/login', (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (login(username, password)) {
    res.send('Login successful');
  } else {
    res.status(401).send('Login failed');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
