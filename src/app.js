const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const flash = require("connect-flash");
const morgan = require("morgan");
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const courseModel = require("./db/courseDB");

const User = require("./db/User");
const isAuthenticated = require("./middlewares/isAuthenticated");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.set("view engine", "ejs");
app.set("views", "src/views");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(mongoSanitize());

const config = require("../config.json");
const addCSRF = require("./middlewares/addCSRF");

// Connect to MongoDB using the configuration
mongoose
  .connect(config.mongodb_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // Start your application logic here
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) return done(null, false, { message: "Incorrect username." });
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch)
        return done(null, false, { message: "Incorrect password." });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});

app.use(cookieParser());
//app.use(csrf());
//app.use(addCSRF)
app.use(
  session({ secret: config.secret_key, resave: false, saveUninitialized: true })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//changes
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.get("/login", limiter, csrfProtection, (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  } else {
    res.render("login", { messages: req.flash("error"), csrfToken: req.csrfToken() }); // Pass flash messages to the template
  }
});

app.post("/login", limiter, csrfProtection, (req, res, next) => {
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
});

app.get('/logout', limiter, (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.error("Error during logout:", err);
    } else {
      res.redirect('/login');
    }
  });
});

app.get("/", isAuthenticated, (req, res) => {
  // This route is protected and can only be accessed by authenticated users
  res.render("home");
});

app.get("/register", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");
  console.log(req.csrfToken())
  res.render("register", { messages: req.flash("error"), csrfToken: req.csrfToken() });
});

app.post("/register", limiter, csrfProtection, async (req, res) => {
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

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user document and save it to the database
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
      fullName
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
});

app.get('/profile', isAuthenticated, async (req, res) => {
  res.render('profile', { user: req.user, messages: req.flash(), csrfToken: req.csrfToken() });
});

app.post('/profile', limiter, isAuthenticated, csrfProtection, async (req, res) => {
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
});

app.use("/courses", limiter, isAuthenticated, async function (req, res) {
  const courses = await courseModel.find();
  return res.render("course", { courses: courses });
});

app.post("/search-course", limiter, isAuthenticated, async function (req, res) {
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
});

app.use("/css", express.static("src/css"));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
