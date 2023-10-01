// Middleware function to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next(); // Continue to the next middleware if the user is authenticated
    }
    res.redirect('/login'); // Redirect to the login page if not authenticated
  }

  module.exports = isAuthenticated;