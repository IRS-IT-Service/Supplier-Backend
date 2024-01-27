const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: [true],
    },
    VendorId: {
      type: String,
      required: [true],
    },
    Amount: {
      type: Number,
      required: [true],
    },
    PaymentMode:{
      type: String,
      required: [true],
      enum: ['payment', 'conversion','purchase','paymentRMB'],
    },
    RefId:{
      type: String,
      required: [true],
    },
    Currency: {
      type: String,
      required: [true],
      enum: ['USD', 'RMB', 'INR'],
    },
    type: {
      type: String,
      required: [true],
      enum: ['cr','dr'],
    },

    Date: {
      type: Date,
      default: Date.now()
     
    },
    PreviosAmount: {
      type: Number,
      required: [true],
    },
    FinalAmount: {
      type: Number,
      required: [true],
    },
    otherinfo: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
