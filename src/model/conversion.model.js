const mongoose = require("mongoose");

const conversionSchema = mongoose.Schema(
  {
    conversionId: {
      type: String,
      required: [true],
    },
    USD: {
      type: Number,
      required: [true],
    },
    RMB: {
      type: Number,
      required: [true],
    },
    ConversionRate: {
      type: Number,
    },
    VendorId: {
      type: String,
      required: [true],
    },
    File: {
      type: String,
    },

    otherInfo: {
      type: Object,
    },

    isFullfilledAdmin: {
      type: Boolean,
      default: false,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversion", conversionSchema);
