const jwt = require("jsonwebtoken");
// const { generateToken } = require("../service/utils/generateToken");
const user = require("../model/user.model");
const clientUser = require("../model/clientUser.model");

const jwtAuthentication = async (req, res, next) => {
  let token;

  // Check if the token is in cookies
  if (req.cookies && req.cookies) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded.id);

      req.user = await user.findById(decoded.id).select("-password");
    
      if (!req.user.isActive) {
        return res.status(401).send("Account Paused Token Failed");
      }
      next();
    } catch (err) {
      console.log(err);
      res.status(401).send("Not authorized Token failed");
    }
  } else {
    res.status(401).send("Not Authorized, No token");
  }
};

const clientJwtAuthentication = async (req, res, next) => {
  let token;

  // Check if the token is in cookies
  if (req.cookies && req.cookies) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded.id);

      req.user = await clientUser.findById(decoded.id).select("-password");
      if (!req.user.isActive) {
        return res.status(401).send("Account Paused Token Failed");
      }
      next();
    } catch (err) {
      console.log(err);
      res.status(401).send("Not authorized Token failed");
    }
  } else {
    res.status(401).send("Not Authorized, No token");
  }
};

module.exports = {
  jwtAuthentication,
  clientJwtAuthentication
};
