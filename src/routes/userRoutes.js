const express=require("express");
const { loginGet, loginPost, logout, landingPage, registerGet, registerPost, profileGet, profilePost, searchCourse } = require("../controller/userRoutesController");
const limiter=require("../utils/limiter")
const isAuthenticated = require("../middlewares/isAuthenticated");

const router=express.Router();



router.route("/create").post(authenticate,createProduct)

router.route("/login").get(loginGet)
router.route("/login").post(loginPost)
router.route("/logout").get(limiter,logout)
router.route("/").get(isAuthenticated,landingPage)
router.route("/register").get(registerGet)
router.route("/register").post(limiter,registerPost)
router.route("/profile").get(limiter,isAuthenticated,profileGet)
router.route("/profile").post(limiter,isAuthenticated,profilePost)
router.route("/search-course").post(limiter,isAuthenticated,searchCourse)


module.exports=router;