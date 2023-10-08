const express = require("express");

const fs = require("fs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const flash = require("connect-flash");
const morgan = require("morgan");
const bodyparser = require('body-parser')
const limiter=require("./utils/limiter")
const addCSRF = require("./middlewares/addCSRF");

const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");
const path = require("path");

const dbConfig = require("./config/dbconfig");
dotenv.config();
// Connect to MongoDB using the configuration
dbConfig();

const courseModel = require("./db/courseDB");

const User = require("./db/User");
const isAuthenticated = require("./middlewares/isAuthenticated");

const app = express();


//Views folder should be accessible from anywhere..
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({extended:true}));
// app.use(app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(morgan("dev"));

app.use(mongoSanitize());

//Regular middleware
app.use(cookieParser());
const csrf = require("csurf");

app.use(
  session({
    secret: process.env.SECRET_KEY,   
    resave: false,
    saveUninitialized: true,
  })
);       

app.use(csrf());
app.use(addCSRF)

app.use(flash());
// Initialize Passport and session middleware
require("./config/passportConfig");
app.use(passport.initialize());
app.use(passport.session());
//changes
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);



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

app.get("/create-course", csrfProtection, isAuthenticated, async function (req, res) {
  return res.render("course-create", { messageError: req.flash("error"), messageSuccess: req.flash("success"), csrfToken: req.csrfToken() });
});

app.post("/create-course", isAuthenticated, csrfProtection, async function (req, res) {
  // TODO: Need to implement upload image logic
  try {
    const { courseName, shortDescription, longDescription, duration, durationType, imageFile, difficulty } = req.body;
    const userName = req.user.fullName;
    const findExistingCourse = await courseModel.findOne({ title: {'$regex': `^${courseName}$`, $options: 'i'} });
    if (!findExistingCourse) {
      const newCourse = new courseModel({
        title: courseName,
        shortDescription: shortDescription,
        longDescription: { longDescription: longDescription },
        duration: duration,
        durationType: durationType?.toLowerCase(),
        difficulty: difficulty,
        image: imageFile,
        author: userName
      });

      await newCourse.save();
      req.flash("success", "Course created successfully");
      return res.redirect("/create-course");
    } else {
      req.flash("error", "This course is already available.");
      return res.redirect("/create-course");
    }
  } catch (error) {
    console.error("Error during course creation:", error);
    req.flash("error", "Failed to create the course. Please try again.");
    res.redirect("/create-course");
  }
});

app.use("/css", express.static("src/css"));

// user routes
const userRoutes=require("./routes/userRoutes")
app.use(userRoutes)

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
