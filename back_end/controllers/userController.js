const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT } = require("../utils/generateToken");
const transporter = require("../utils/transporter");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const ShortUniqueId = require("short-unique-id");
const {
  deleteImagefromCloudinary,
  uploadImage,
} = require("../utils/uploadImage");
const { randomUUID } = new ShortUniqueId({ length: 5 });
require("dotenv").config();
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.ACCOUNT_TYPE,
    project_id: process.env.BACKEND_PRIJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_URL,
    client_x509_cert_url: process.env.CLIENT_URL,
    universe_domain: process.env.UNIVERSAL_DOMAIN,
  }),
});

const createUsers = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "User name is required🙂",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required🙂",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required🙂",
      });
    }

    const checkForExistingUser = await User.findOne({ email });
    if (checkForExistingUser) {
      if (checkForExistingUser.googleAuth) {
        return res.status(400).json({
          success: false,
          message:
            "Already registered via google,login with google to continue",
        });
      }

      if (checkForExistingUser.verify) {
        return res.status(400).json({
          success: false,
          message: "This User Email is already registered😊",
        });
      } else {
        let verificationToken = await generateJWT({
          email: checkForExistingUser.email,
          id: checkForExistingUser._id,
        });
        const sendingEmail = await transporter.sendMail({
          from: process.env.AUTH_USER,
          to: checkForExistingUser.email,
          subject: "Email Verification",
          text: "Please verify your email",
          html: `<h1>Click on the link to verify your email</h1>
             <a href="${process.env.ORIGIN_URL}/verify-email/${verificationToken}">Verify Email</a>`,
        });
        return res.status(200).json({
          success: true,
          message: "Please check your Email to verify 💁‍♂️",
        });
      }
    }
    const hashedpass = await bcrypt.hash(password, 10);
    const username = email.split("@")[0] + randomUUID();
    const newUser = await User.create({
      name,
      password: hashedpass,
      email,
      username,
    });

    let verificationToken = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    const sendingEmail = await transporter.sendMail({
      from: process.env.AUTH_USER,
      to: email,
      subject: "Email Verification",
      text: "Please verify your email",
      html: `<h1>Click on the link to verify your email</h1>
             <a href="${process.env.ORIGIN_URL}/verify-email/${verificationToken}">Verify Email</a>`,
    });
    return res.status(200).json({
      success: true,
      message: "Please check your Email to verify 💁‍♂️",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong❎",
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    console.log("hii");
    const { verificationToken } = req.params;
    const verifyToken = await verifyJWT(verificationToken);

    if (!verifyToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token❎",
      });
    }
    const { id } = verifyToken;

    console.log("hmmm", id);
    const user = await User.findByIdAndUpdate(
      id,
      { verify: true },
      { new: true },
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found 😢 signUp to continue",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully✅",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong❎",
      error: error.message,
    });
  }
};

async function GooGleAuth1(req, res) {
  try {
    const { accessToken } = req.body;
    const response = await getAuth().verifyIdToken(accessToken);
    const { name, email, picture } = response;
    console.log(response);
    const username = email.split("@")[0] + randomUUID();
    let user = await User.findOne({ email });
    if (user) {
      if (user.googleAuth) {
        let token = await generateJWT({
          email: user.email,
          id: user._id,
        });

        return res.status(200).json({
          success: true,
          message: "logged in successfully✅ via google",
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            profilePic: picture,
            bio: user.bio,
            token,
          },
        });
      } else {
        return res.status(400).json({
          success: true,
          message: "this user is already registerd try something new continue.",
        });
      }
    }

    let newUser = await User.create({
      name,
      username,
      email,
      googleAuth: true,
      profilePic: picture,
    });

    let token = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "logged in successfully✅",
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
        bio: newUser.bio,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong❎",
      error: error.message,
    });
  }
}

const logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required🙂",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required🙂",
      });
    }

    const checkForExistingUser = await User.findOne({ email });

    if (!checkForExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found 😢 signUp to continue",
      });
    }
    if (checkForExistingUser.googleAuth) {
      return res.status(400).json({
        success: false,
        message: "Already registered via google,login with google to continue",
      });
    }

    const checkForPass = await bcrypt.compare(
      password,
      checkForExistingUser.password,
    );

    if (!checkForPass) {
      return res.status(500).json({
        success: false,
        message: "Incorrect password❎",
      });
    }

    if (!checkForExistingUser.verify) {
      let verificationToken = await generateJWT({
        email: checkForExistingUser.email,
        id: checkForExistingUser._id,
      });

      const sendingEmail = await transporter.sendMail({
        from: process.env.AUTH_USER,
        to: checkForExistingUser.email,
        subject: "Email Verification",
        text: "Please verify your email",
        html: `<h1>Click on the link to verify your email</h1>
             <a href="${process.env.ORIGIN_URL}/verify-email/${verificationToken}">Verify Email</a>`,
      });
      return res.status(200).json({
        success: true,
        message: "Please check your Email to verify 💁‍♂️",
      });
    }

    let token = await generateJWT({
      email: checkForExistingUser.email,
      id: checkForExistingUser._id,
    });
    // console.log(checkForExistingUser.profilePic)
    return res.status(200).json({
      success: true,
      message: "logged in successfully✅ via form",
      user: {
        id: checkForExistingUser._id,
        name: checkForExistingUser.name,
        username: checkForExistingUser.username,
        email: checkForExistingUser.email,
        profilePic: checkForExistingUser.profilePic,
        bio: checkForExistingUser.bio,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong❎",
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users == 0) {
      return res.status(400).json({
        success: false,
        message: "User not found😒",
      });
    }
    return res.status(200).json({
      success: true,
      message: "profile fetched successfully✅",
      user: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong❎",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const username = req.params.username;
    const searchUsers = await User.findOne({ username })
      .populate("blogs followers followings likeBlogs saveBlogs")
      .select("-password -verify -__v -googleAuth");
    if (!searchUsers) {
      return res.status(400).json({
        success: false,
        message: "User not found😒",
      });
    }
    return res.status(200).json({
      success: true,
      message: "profile fetched successfully✅",
      user: searchUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong❎",
      error: error.message,
    });
  }
};

const updateUsers = async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    const image = req.file;
    const id = req.params.id;

    const user = await User.findById(id);
    if (image) {
      if (user.profilePicId) {
        await deleteImagefromCloudinary(user.profilePicId);
      }

      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${image.buffer.toString("base64")}`,
      );

      user.profilePic = secure_url;
      user.profilePicId = public_id;
    }

    console.log(user);
    if (user.username != username) {
      const findUser = await User.findOne({ username });
      if (findUser) {
        return res.status(400).json({
          success: false,
          message: "This username is already taken😒",
        });
      }
    }

    user.name = name;
    user.username = username;
    user.bio = bio;

    user.save();
    return res.status(200).json(
      {
        successs: true,
        message: "profile updated successfully✅",
        user: {
          name: user.name,
          username: user.username,
          bio: user.bio,
          profilePic: user.profilePic,
        },
      },
      { new: true },
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in updating profile❎",
      error: error.message,
    });
  }
};

const deleteUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(200).json({
        success: false,
        message: "User not found😒",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully✅",
      user: deletedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong❎",
      error: error.message,
    });
  }
};

const followUser = async (req, res) => {
  try {
    const id = req.params.id;
    const followerId = req.user;

    const user = await User.findById(id);

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "user not found😢",
      });
    }

    if (!user.followers.includes(followerId)) {
      await User.findByIdAndUpdate(id, { $set: { followers: followerId } });
      await User.findByIdAndUpdate(followerId, { $set: { followings: id } });

      return res.status(200).json({
        success: true,
        message: "follow successfully✅",
      });
    } else {
      await User.findByIdAndUpdate(id, { $unset: { followers: followerId } });
      await User.findByIdAndUpdate(followerId, { $unset: { followings: id } });
      return res.status(200).json({
        success: true,
        message: "unfollow successfully✅",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in unfollow❎",
      error: error.message,
    });
  }
};

module.exports = {
  createUsers,
  getUsers,
  getUserById,
  updateUsers,
  deleteUsers,
  logIn,
  generateJWT,
  verifyEmail,
  GooGleAuth1,
  followUser,
};
