const passport = require("passport");
const csrf=require("csurf");
const addCSRF=require("../middlewares/addCSRF")
const isAuthenticated=require("../middlewares/isAuthenticated")
const User=require("../db/User")
const bcrypt=require("bcrypt")
const courseModel= require("../db/courseDB")
const csrfProtection = csrf({cookie:true});






exports.loginGet=(req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    } else {
      res.render("login", {
        messages: req.flash("error"),
        csrfToken: req.csrfToken(),
      }); // Pass flash messages to the template
    }
  };
  
  exports.loginPost=(req, res, next) => {
    /*console.log(req.body, req.csrfToken())
    if (!req.body._csrf || req.body._csrf !== req.csrfToken()) {
      return res.status(403).send("CSRF token validation failed.");
    }*/
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("error", "Incorrect username or password."); // Set flash message
        return res.redirect("/login"); // Redirect with flash message
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect("/");
      });
    })(req, res, next);
  };

  exports.logout=(req, res) => {
    req.session.destroy(function (err) {
      if (err) {
        console.error("Error during logout:", err);
      } else {
        res.redirect("/login");
      }
    });
  };

exports.landingPage= (req, res) => {
    // This route is protected and can only be accessed by authenticated users
    res.render("home");
  };

  exports.registerGet= (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/");
    console.log(req.csrfToken());
    res.render("register", {
      messages: req.flash("error"),
      csrfToken: req.csrfToken(),
    });
  };




  exports.registerPost=async (req, res) => {
    /*if (!req.body._csrf || req.body._csrf !== req.csrfToken()) {
      return res.status(403).send("CSRF token validation failed.");
    }*/
    const { username, email, password, confirmPassword, fullName } = req.body;
  
    try {
      // Check if the username or email already exists in the database
      const existingUser = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });
  
      if (existingUser) {
        req.flash("error", "Username or email already in use.");
        return res.redirect("/register");
      }
  
      // Check if the password and confirmPassword match
      if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match.");
        return res.redirect("/register");
      }
      if (password.length < 6) {
        req.flash("error", "Password should be at least 6 characters long.");
        return res.redirect("/register");
      }
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,7}$/;
    if (!email.match(emailRegex)) {
      req.flash("error", "Invalid email address format.");
      return res.redirect("/register");
    }
  
      // Hash the password before saving it
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user document and save it to the database
      const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword,
        fullName,
        // Additional user profile fields can be added here
      });
  
      await newUser.save();
  
      // Redirect to the login page after successful registration
      res.redirect("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      req.flash("error", "Registration failed. Please try again.");
      res.redirect("/register");
    }
  };


exports.profileGet=async (req, res) => {
    res.render("profile", {
      user: req.user,
      messages: req.flash(),
      csrfToken: req.csrfToken(),
    });
  };



  exports.profilePost= async (req, res) => {
    /*if (!req.body._csrf || req.body._csrf !== req.csrfToken()) {
      return res.status(403).send("CSRF token validation failed.");
    }*/
    const { fullName, avatarUrl, bio, location, website } = req.body;
  
    try {
      // Find the user by their ID (you need to have the user ID stored in the session)
      const userId = req.user._id; // Assuming you have a user object in the session
      const user = await User.findById(userId);
  
      if (!user) {
        // Handle the case where the user is not found
        return res.status(404).send("User not found.");
      }
  
      // Update the user's profile fields
      user.fullName = fullName;
      user.avatarUrl = avatarUrl;
      user.bio = bio;
      user.location = location;
      user.website = website;
  
      // Save the updated user profile
      await user.save();
  
      // Redirect to the user's profile page or any other desired page
      return res.redirect("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Handle the error, display an error message, or redirect to an error page
      return res.status(500).send("Error updating profile.");
    }
  };


  exports.searchCourse=async function (req, res) {
    const query = req.body.query;
    const regexQuery = {
      title: { $regex: query, $options: "i" },
    };
    try {
      const searchCourses = await courseModel.findOne(regexQuery);
      res.json(searchCourses);
    } catch (err) {
      console.error(err);
      res.json({ message: "An error occurred while searching." });
    }
  };