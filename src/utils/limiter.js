const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });

  module.exports=limiter;