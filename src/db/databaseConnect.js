const mongoose=require("mongoose");
const dotenv=require("dotenv");
const config=require("../config.json")



const connectDatabase=()=>{
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
}

module.exports=connectDatabase;