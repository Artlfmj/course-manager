const express=require("express");
const csrf=require("csurf")
const addCSRF = require("../middlewares/addCSRF");
const csrfProtection=csrf({cookie:true})
const {loginGet, loginPost, logout, landingPage, registerGet, registerPost, profileGet, profilePost, searchCourse}=require("../controller/userController")
// const { loginGet, loginPost, logout, landingPage, registerGet, registerPost, profileGet, profilePost, searchCourse } = require("../controller/userRoutesController");
const limiter=require("../utils/limiter")
const isAuthenticated = require("../middlewares/isAuthenticated");

const router=express.Router();



router.route("/login").get(limiter,csrfProtection,loginGet)
router.route("/login").post(csrfProtection,limiter,loginPost)
router.route("/logout").get(limiter,logout)
router.route("/").get(limiter,isAuthenticated,landingPage)
router.route("/register").get(limiter,registerGet)
router.route("/register").post(limiter,csrfProtection,registerPost)
router.route("/profile").get(limiter,isAuthenticated,profileGet)
router.route("/profile").post(limiter,isAuthenticated,csrfProtection,profilePost)
router.route("/search-course").post(limiter,isAuthenticated,searchCourse)


module.exports=router;