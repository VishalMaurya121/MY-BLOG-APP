const Blog = require("../models/blogSchema");
const User = require("../models/userSchema");
const Like = require("../models/likeSchema");
const Comment = require("../models/commentSchema");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 10 });
const { verifyJWT, decodeJWT } = require("../utils/generateToken");
const {
  uploadImage,
  deleteImagefromCloudinary,
} = require("../utils/uploadImage");
const fs = require("fs");

const createBlogs = async (req, res) => {
  try {
    const creator = req.user;
    const { title, description, draft } = req.body;
    const content = JSON.parse(req.body.content);
    const tags = JSON.parse(req.body.tags);

    const image = req.files?.image?.[0];
    const images = req.files?.images || [];

    if (!title)
      return res.status(400).json({
        success: false,
        message: "please fill title",
      });
    if (!description)
      return res.status(400).json({
        success: false,
        message: "please fill description",
      });
    if (!creator)
      return res.status(400).json({
        success: false,
        message: "creator is required",
      });
    if (!content)
      return res.status(400).json({
        success: false,
        message: "content is required",
      });

    const findUser = await User.findById(creator);
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "User not found 😕 please check creator id carefully",
      });
    }

    let imageIndex = 0;
    for (let i = 0; i < content.blocks.length; i++) {
      const block = content.blocks[i];
      if (block.type == "ImageTool") {
        console.log(images[imageIndex]);
        const { secure_url, public_id } = await uploadImage(
          `data:image/jpeg;base64,${images[imageIndex].buffer.toString(
            "base64",
          )}`,
        );
        block.data.file = {
          url: secure_url,
          imageId: public_id,
        };
        imageIndex++;
      }
    }

    // Cloudinary upload for main featured image
    const { secure_url, public_id } = await uploadImage(image.buffer);

    const blogId =
      title.toLowerCase().split(" ").join("-") + "-" + randomUUID();

    const blog = await Blog.create({
      title,
      description,
      draft,
      creator,
      image: secure_url,
      imageId: public_id,
      blogId,
      content,
      tags,
    });

    await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });

    if (draft) {
      return res.status(200).json({
        success: true,
        message: "save as draft successfully✅",
        blogs: blog,
      });
    }

    return res.status(200).json({
      success: true,
      message: "blog created/posted successfully✅",
      blogs: blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something wrong❎",
      error: error.message,
    });
  }
};

const getBlogs = async (req, res) => {
  try {
    console.log(req.query);
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    let displayBlog = await Blog.find({ draft: false })
      .populate({
        path: "creator",
        select: "name",
      })
      .populate({
        path: "likes",
        select: "email name",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments({ draft: false });

    if (displayBlog == 0) {
      return res.status(400).json({
        success: false,
        message: "blogs not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "blogs fetched successfully✅",
      blogs: displayBlog,
      hasMore: skip + limit < totalBlogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something wrong❎",
      error: error.message,
    });
  }
};

const getBlogsById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const searchBlogs = await Blog.findOne({ blogId })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "creator",
        select: "name email username followers",
      });

    if (!searchBlogs) {
      return res.status(404).json({
        success: false,
        message: "blog not found 😢",
      });
    }
    return res.status(200).json({
      success: true,
      message: "blogs fetched successfully✅",
      blogs: searchBlogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something wrong❎",
      error: error.message,
    });
  }
};

async function updateBlogs(req, res) {
  try {
    const creator = req.user;
    const { title, description, draft } = req.body;
    const content = JSON.parse(req.body.content);
    const tags = JSON.parse(req.body.tags);
    const existingImages = JSON.parse(req.body.existingImages);
    const id = req.params.id;

    const user = await User.findById(creator).select("-password");

    const blog = await Blog.findOne({ blogId: id });

    if (!(creator == blog.creator)) {
      return res.status(500).json({
        message: "You are not authorized for this action ❎",
      });
    }

    let imagesToDelete = blog.content.blocks
      .filter((block) => block.type == "ImageTool")
      .filter(
        (block) =>
          !existingImages.find(({ url }) => url == block.data.file.url),
      )
      .map((block) => block.data.file.imageId);

    if (imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map((id) => deleteImagefromCloudinary(id)),
      );
    }

    if (req.files.images) {
      let imageIndex = 0;
      for (let i = 0; i < content.blocks.length; i++) {
        const block = content.blocks[i];
        if (block.type == "ImageTool" && block.data.file.image) {
          // console.log(images[imageIndex]);
          const { secure_url, public_id } = await uploadImage(
            `data:image/jpeg;base64,${req.files.images[
              imageIndex
            ].buffer.toString("base64")}`,
          );
          block.data.file = {
            url: secure_url,
            imageId: public_id,
          };
          imageIndex++;
        }
      }
    }

    if (req.files.image) {
      console.log(req.files.image);
      await deleteImagefromCloudinary(blog.imageId);
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${req.files.image[0].buffer.toString("base64")}`,
      );
      blog.image = secure_url;
      blog.imageId = public_id;
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.draft = draft || blog.draft;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;

    await blog.save();

   return res.status(200).json({
      success: true,
      message: "Blog updated successfully✅",
      blog,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something 1 wrong❎",
      error: error.message,
    });
  }
}

const deleteBlogs = async (req, res) => {
  try {
    const id = req.params.id;
    const creator = req.user;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "blog not found 😢",
      });
    }

    if (!(creator == blog.creator)) {
      return res.status(500).json({
        message: "You are not authorized for this action ❎",
      });
    }

    await deleteImagefromCloudinary(blog.imageId);

    await Blog.findByIdAndDelete(id);
    await User.findByIdAndUpdate(creator, { $pull: { blogs: id } });
    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully✅",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something wrong❎",
      error: error.message,
    });
  }
};

const likeBlogs = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "blog not found 😢",
      });
    }

    if (!blog.likes.includes(user)) {
      await Blog.findByIdAndUpdate(id, { $push: { likes: user } });
      await User.findByIdAndUpdate(user, { $push: { likeBlogs: id } });

      return res.status(200).json({
        success: true,
        message: "blog Liked successfully✅",
        isLiked: true,
      });
    } else {
      await Blog.findByIdAndUpdate(id, { $pull: { likes: user } });
      await User.findByIdAndUpdate(user, { $pull: { likeBlogs: id } });

      return res.status(200).json({
        success: true,
        message: "blog Unliked successfully✅",
        isLiked: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something wrong❎",
      error: error.message,
    });
  }
};

const saveBlogs = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "blog not found 😢",
      });
    }

    if (!blog.bookMarks.includes(user)) {
      await Blog.findByIdAndUpdate(id, { $set: { bookMarks: user } });
      await User.findByIdAndUpdate(user, { $set: { saveBlogs: id } });

      return res.status(200).json({
        success: true,
        message: "saved successfully✅",
        isLiked: true,
      });
    } else {
      await Blog.findByIdAndUpdate(id, { $unset: { bookMarks: user } });
      await User.findByIdAndUpdate(user, { $unset: { saveBlogs: id } });

      return res.status(200).json({
        success: true,
        message: "unsaved successfully✅",
        isLiked: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something wrong❎",
      error: error.message,
    });
  }
};

module.exports = {
  createBlogs,
  getBlogs,
  getBlogsById,
  updateBlogs,
  deleteBlogs,
  likeBlogs,
  saveBlogs,
};
