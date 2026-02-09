const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connnectDB");
const app = express();
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
const cloudinaryConfig = require("./config/cloudinaryConfig");
require("dotenv").config();

const PORT = process.env.PORT || 3000;


const corsOptions = {
  origin: process.env.ORIGIN_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};;

app.use("/api/v1", userRoutes);
app.use("/api/v1", blogRoutes);

app.listen(PORT, () => {
  console.log(`server running...${PORT}`);
  connectDB();
  cloudinaryConfig();
});
