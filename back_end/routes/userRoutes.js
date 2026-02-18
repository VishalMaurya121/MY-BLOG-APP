const verifyUser = require("../middlewares/authorization");
const {
  createUsers,
  getUsers,
  getUserById,
  updateUsers,
  deleteUsers,
  logIn,
  verifyEmail,
  GooGleAuth1,
  followUser
} = require("../controllers/userController");

const express = require("express");
const upload = require("../utils/multer");

const route = express.Router();
//const route=express();

route.post("/signup", createUsers);
route.post("/signin", logIn);
route.get("/users", getUsers);
route.get("/users/:username", getUserById);
route.patch("/users/:id", verifyUser, upload.single("profilePic"), updateUsers);
route.delete("/users/:id", verifyUser, deleteUsers);

route.get("/verify-email/:verificationToken", verifyEmail);
route.post("/google-auth", GooGleAuth1);
route.patch("/follow/:id",verifyUser,followUser)

 

module.exports = route;   
