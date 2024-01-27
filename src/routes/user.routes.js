const {
  registerUser,
  authUser,
  verifyOtp,
  logoutUser,
  getAllUser,
  userForgetOTP,
  verifyresetwithOtp,
  toggleUser,
  removeUser

} = require("../controller/user.controller");
const express = require("express");
const { jwtAuthentication } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/registerUser", registerUser);
router.post("/authUser", authUser);
router.post("/verifyOtp", verifyOtp);
router.post("/logout", logoutUser);
router.post("/userForgetOTP", userForgetOTP);
router.post("/verifyresetwithOtp", verifyresetwithOtp);
router.get("/getAllUser", jwtAuthentication, getAllUser);
router.post("/toggleUser", jwtAuthentication, toggleUser);
router.post("/removeUser", jwtAuthentication, removeUser);

module.exports = router;
