const mongoose = require("mongoose");

const adminShipmentSchema = mongoose.Schema(
  {
    TrackingId: {
      type: String,
      required: [true],
      unique: true,
    },
    VendorId: {
      type: String,
      required: [true],
    },
    CourierName: {
      type: String,
      required: [true],
    },
    NoOfBoxes: {
      type: Number,
    },
    remark: {
      type: String,
      required: [true],
    },
    BoxDetails: {
      type: Array,
    },
    file: {
      type: Array,
    },
    isFullfilled: {
      type: Boolean,
      default: false,
    },
    isVerified:{
      type:Boolean,
      default:false
    },
    isRejected:{
      type:Boolean,
      default:false
    },
    otherInfo: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AdminShipment", adminShipmentSchema);
