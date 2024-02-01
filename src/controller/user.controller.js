const user = require("../model/user.model");
const { generateToken } = require("../service/utils/generateToken");
const guid = require("generate-unique-id");
const sendMessage = require("../commonFunction/whatsAppMessage");
const generateUniqueId = require("generate-unique-id");
const userModel = require("../model/user.model");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const userId = guid({
      length: 4,
      useLetters: false,
    });
    const otp = guid({
      length: 4,
      useLetters: false,
    });
    if (!userName && !email && !password) {
      throw new Error("Missing Require field");
    }
    const userExists = await user.findOne({ email });
    if (userExists) {
      throw new Error("User Already exists");
    }
    const result = await user.create({
      userName,
      password,
      email,
      userId: `IRS${userId}`,
      otp,
    });
    const clientId = await sendMessage(`Your Otp is ${otp}`);

    if (!result) {
      throw new Error("Error Occured ..");
    }

    res.status(200).send({
      status: true,
      message: `We have sent a code to Admin Whatsapp No ${clientId}`,
      data: {
        userId: result.userId,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const userForgetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    let guiOTP = generateUniqueId({
      length: 4,
      useLetters: false,
    });
    const userExist = await user.findOne({ email: email });

    if (!userExist) {
      throw new Error("User not found");
    }

    userExist.resetOtp = guiOTP;
    userExist.save();
    const clientId = await sendMessage(`Your Otp is ${guiOTP}`);
    res.status(200).send({
      status: true,
      message: `We have sent a code to Admin Whatsapp No ${clientId}`,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const verifyresetwithOtp = async (req, res) => {
  try {
    const { userId, otp, password } = req.body;

    const userData = await user.findOne({ userId });
    if (!userData) {
      throw new Error("User not Found");
    }

    if (otp !== userData.resetOtp) {
      throw new Error("Invalid OTP");
    }
    if (!password) {
      throw new Error("Please enter new password");
    }
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);

    const response = await user.findOneAndUpdate(
      { userId },
      { $set: { password: newPassword } }
    );

    return res
      .status(200)
      .send({ status: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const userData = await user.findOne({ userId });

    if (otp !== userData.otp) {
      throw new Error("Invalid OTP");
    }

    const isVerify = await user.findOneAndUpdate(
      { userId },
      { $set: { isActive: true } }
    );

    return res
      .status(200)
      .send({ status: true, message: "User id create successfully  " });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await user.findOne({ email });

    if (!userData) {
      throw new Error("Invalid Email");
    }

    const matchPassword = await userData.matchPassword(password);

    if (!matchPassword) {
      throw new Error("Invalid Password");
    }

    if (!userData.isActive) {
      throw new Error("Your account has been paused");
    }

    const token = generateToken(userData._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
    });

    res.status(200).send({
      status: true,
      message: "Login successful",
      data: {
        userId: userData.userId,
        userName: userData.userName,
        email: userData.email,
        isAdmin: userData.isAdmin,
        userType: userData.userType,
      },
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const logoutUser = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).send({
      status: true,
      message: "Logout successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

const getAllUser = async (req, res) => {
  try {
    const allUserData = await user.find({}).select("-password -otp").lean();
    // Modify the result to add 'id' field
    const modifiedUserData = allUserData.map((user, index) => ({
      ...user,
      id: user.userId,
      Sno: index + 1,
    }));

    res.status(200).send({
      status: true,
      message: "All User Fetched Successfully",
      data: modifiedUserData,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const toggleUser = async (req, res) => {
  try {
    const { isActive, isAdmin, userId } = req.body;

    const userData = await user.findOne({ userId });

    if (!userData) {
      throw new Error("User not found");
    }

    let updateFields = {};

    if (isAdmin !== undefined) {
      updateFields.isAdmin = isAdmin;
    }

    if (isActive !== undefined) {
      updateFields.isActive = isActive;
    }

    const updatedUser = await user.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true }
    );

    res.status(200).send({
      status: true,
      message: "User has been updated",
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const removeUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await user.findOneAndDelete({ userId });
    if (!userData) {
      throw new Error("user not found");
    }
    res.status(200).send({ status: true, message: "User has been deleted" });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  registerUser,
  authUser,
  verifyOtp,
  logoutUser,
  getAllUser,
  userForgetOTP,
  verifyresetwithOtp,
  toggleUser,
  removeUser,
};
