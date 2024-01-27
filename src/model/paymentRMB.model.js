const mongoose = require("mongoose");

const paymentRMBSchema = mongoose.Schema({
    PaymentId: {
        type: String,
        required: [true],
      },
      VendorId: {
        type: String,
        required: [true],
      },
      PaymentAmount: {
        type: Number,
        required: [true],
      },
      Description: {
        type: String,
      },
      isFullfilled: {
        type: Boolean,
        default: false,
      },
      isRejected: {
        type: Boolean,
        default: false,
      },
      PaymentDate: {
        type: Date,
        required: [true],
      },
  
      Reciept: {
        type: String,
      },
      otherinfo: {
        type: Object,
      },
},
{
    timestamps: true,
  }
)

module.exports = mongoose.model("PaymentRMB", paymentRMBSchema);
