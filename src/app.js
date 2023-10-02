const express = require("express");
const path = require('path');
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

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 20, // 5 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
// });                  --- by me

app.set("view engine", "ejs");
// app.set("views", "src/views");
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(mongoSanitize());

const config = require("../config.json");
const addCSRF = require("./middlewares/addCSRF");
const connectDatabase = require("./db/databaseConnect");

// Connect to MongoDB using the configuration
connectDatabase();


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


app.use("/courses", limiter, isAuthenticated, async function (req, res) {
  const courses = await courseModel.find();
  return res.render("course", { courses: courses });
});

//Route imports
const userRoutes=require("./routes/userRoutes");

app.use(userRoutes);

app.use("/css", express.static("src/css"));
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
