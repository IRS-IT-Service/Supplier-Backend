const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const setupBcryptSchema = require("../commonFunction/bycrptschema");
const clientUserSchema = mongoose.Schema(
  {
    CompanyName: {
      type: String,
      required: true,
    },
    VendorId: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    balanceUSD: {
      type: Number,
      default: 0,
    },
    balanceRMB: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    clientType: {
      type: String,
      required: true,
      enum: ["RMBandUSD", "USD", "RMB"],
    },

    otherInfo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

setupBcryptSchema(clientUserSchema);

module.exports = mongoose.model("ClientUser", clientUserSchema);
