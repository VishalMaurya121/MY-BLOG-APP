const jwt = require("jsonwebtoken");

async function generateJWT(payload) {
  let token = await jwt.sign(payload, process.env.JWT_SECRET);
  return token;
}

async function verifyJWT(token) {
  try {
    let data = await jwt.verify(token, process.env.JWT_SECRET);
    return data;
  } catch (error) {
    return false;
  }
}

async function decodeJWT(token) {
  let decoded = await jwt.decode(token);
  console.log("decoded", decoded);
  return decoded;
}

module.exports = { generateJWT, verifyJWT, decodeJWT };
