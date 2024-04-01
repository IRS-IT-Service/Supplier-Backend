const mongoose = require("mongoose");
const vendorSchema = mongoose.Schema(
  {
    VendorId: {
      type: String,
      required: [true],
      unique: true,
    },
    CompanyName: {
      type: String,
      required: [true],
    },
    ConcernPerson: {
      type: String,
      required: [true],
    },
    Email: {
      type: String,
    },
    Mobile: {
      type: String,
    },
    Tele: {
      type: String,
    },
    Website: {
      type: String,
    },
    comment: {
      type: String,
    },
    Address: {
      type: Object,
    },
    BeneficiaryAddress: {
      type: Array,
    },
    BankDetails: {
      type: Array,
    },
    ChineseCompanyName: {
      type: String,
    },

    ChineseConcernPerson: {
      type: String,
    },
    chineseAddress: {
      type: Object,
    },

    companyLogo: {
      type: Object,
    },
    companyCertificate: {
      type: Object,
    },

    isClient: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vendor", vendorSchema);
