const rateLimit = require("express-rate-limit");


const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 30, // 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
  
module.exports=limiter