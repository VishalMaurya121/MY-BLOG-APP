const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const { updateBlogs } = require("./blogController");

/* ADD COMMENT */
const addComment = async (req, res) => {
  try {
    const { id } = req.params; // blogId
    const userId = req.user;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Please enter comment ❎",
      });
    }

    const newComment = await Comment.create({
      comment,
      blog: id,
      user: userId,
    });

    await newComment.populate({
      path: "user",
      select: "name email",
    });

    await Blog.findByIdAndUpdate(id, {
      $push: { comments: newComment._id },
    });

    return res.status(200).json({
      success: true,
      message: "Comment added successfully ✅",
      comment: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong ❎",
      error: error.message,
    });
  }
};

/* DELETE COMMENT  */
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params; // commentId
    const userId = req.user;

    const comment = await Comment.findById(id).populate({
      path: "blog",
      select: "creator",
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (
      comment.user.toString() !== userId.toString() &&
      comment.blog.creator.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    await Blog.findByIdAndUpdate(comment.blog._id, {
      $pull: { comments: id },
    });

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully ✅",
      commentId: id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong ❎",
      error: error.message,
    });
  }
};

/*  EDIT COMMENT  */
const editComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;
    const { updateComment } = req.body;

    if (!updateComment) {
      return res.status(400).json({
        success: false,
        message: "Updated comment is required",
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { comment: updateComment },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully ✅",
      comment: updatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong ❎",
      error: error.message,
    });
  }
};

/*  LIKE / UNLIKE COMMENT  */
const likeComment = async (req, res) => {
  try {
    const { id } = req.params; // commentId
    const userId = req.user;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found 😢",
      });
    }

    const isLiked = comment.likes.includes(userId);

    if (!isLiked) {
      await Comment.findByIdAndUpdate(id, {
        $push: { likes: userId },
      });

      return res.status(200).json({
        success: true,
        message: "Comment liked successfully ✅",
      });
    } else {
      await Comment.findByIdAndUpdate(id, {
        $pull: { likes: userId },
      });

      return res.status(200).json({
        success: true,
        message: "Comment unliked successfully ✅",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong ❎",
      error: error.message,
    });
  }
};

const searchBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const { search } = req.query;

    const blogs = await Blog.find(
      {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ],
      },
      { draft: false },
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments(
      {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ],
      },
      { draft: false },
    );

    if (blogs.length == 0) {
      return res.status(200).json({
        success: false,
        message: "Again try with different key word😒",
        blogs,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `💁‍♂️ ${totalBlogs - skip} results found`,
        blogs,
        hasMore: skip + limit < totalBlogs,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong in searching Blogs ❎",
      error: error.message,
    });
  }    
};

module.exports = {
  addComment,
  deleteComment,
  editComment,
  likeComment,
  searchBlogs,     
};
