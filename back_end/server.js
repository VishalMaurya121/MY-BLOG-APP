const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connnectDB");
const cloudinaryConfig = require("./config/cloudinaryConfig");
require("dotenv").config();

const app = express();
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "https://my-blog-app-five-alpha.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // ✅ enough for CORS + preflight
app.use(express.json());

app.use("/api/v1", userRoutes);
app.use("/api/v1", blogRoutes);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  connectDB();
  cloudinaryConfig();
});
   