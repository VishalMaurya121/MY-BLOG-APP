const { verifyJWT } = require("../utils/generateToken");

const verifyUser = async (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    //let token=req.headers.authorization.replace("Bearer ","");
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "please sign in to continue",
      });
    }
    try {
      let user = await verifyJWT(token);
      if (!user) {
        res.status(400).json({
          success: false,
          message: "Invalid token please login again",
        });
      }
      req.user = user.id;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Token verification failed",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization failed",
      error: error.message,
    });
  }
};

module.exports = verifyUser;
