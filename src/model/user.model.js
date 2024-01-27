const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const setupBcryptSchema = require("../commonFunction/bycrptschema")
const userSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
      },
      userName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Please fill a valid email address",
        ],
      },
      password: {
        type: String,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      Permissions: {
        type: Array,
        default: [],
      },
      userType: {
        type: String,
        enum: ["Admin", "Normal", "Supplier"],
        default: "Normal",
      },
      otp: {
        type: String,
      },
      resetOtp: {
        type: String,
      },
      whatsappNumber: {
        type: Number,
      },
    },
    {
      timestamps: true,
    }
)

setupBcryptSchema(userSchema)


module.exports = mongoose.model("User", userSchema);