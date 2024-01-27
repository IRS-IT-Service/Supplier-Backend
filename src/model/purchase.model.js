const mongoose = require("mongoose");

const purchaseSchema = mongoose.Schema(
  {
    PurchaseId: {
      type: String,
      required: [true],
    },
    VendorId: {
      type: String,
      required: [true],
    },
    type: {
      type: String,
    },
    PaymentAmount: {
      type: Number,
    },
    PaidTo: {
      type: String,
    },
    Date: {
      type: Date,
      default: new Date(),
      required: [true],
    },
    file: {
      type: String,
    },
    Description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Accepted", "Rejected"],
      default: "Accepted",
    },
    otherinfo: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
