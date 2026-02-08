const mongoose = require("mongoose");
async function connectDB() {
  try { 
    await mongoose.connect(process.env.DB_URL);
    console.log("DB connected  successfully✅");      
  } catch (error) { 
    console.log(error);         
  }      
} 

module.exports = connectDB;     
