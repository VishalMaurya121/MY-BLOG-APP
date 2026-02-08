const {
  createBlogs,
  getBlogs,
  getBlogsById,
  updateBlogs,
  deleteBlogs,
  likeBlogs,
  saveBlogs,
} = require("../controllers/blogController");

const {
  addComment,
  deleteComment,
  editComment,
  likeComment,
  searchBlogs,
} = require("../controllers/commentController");

const verifyUser = require("../middlewares/authorization");

const express = require("express");
const upload = require("../utils/multer");
const route = express.Router();
//const route=express();

//blogs
route.post(
  "/blogs",
  verifyUser,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  createBlogs,
);

route.get("/blogs", getBlogs);
route.get("/blogs/:blogId", getBlogsById);
route.put(
  "/blogs/:id",
  verifyUser,    
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  updateBlogs,
);
route.delete("/blogs/:id", verifyUser, deleteBlogs);

//like
route.post("/blogs/like/:id", verifyUser, likeBlogs);

//comment
route.post("/blogs/comment/:id", verifyUser, addComment);
route.delete("/blogs/deleteComment/:id", verifyUser, deleteComment);
route.put("/blogs/editComment/:id", verifyUser, editComment);
route.put("/blogs/likeComment/:id", verifyUser, likeComment);

//save blogs
route.patch("/save-blogs/:id", verifyUser, saveBlogs);

//search blogs
route.get("/search-blogs", searchBlogs);

module.exports = route;
