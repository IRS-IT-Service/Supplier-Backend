const vendor = require("../model/vender.model");
const clientUser = require("../model/clientUser.model");
const generateUniqueId = require("generate-unique-id");
var path = require("path");
const fs = require("fs");

const registerVendor = async (req, res) => {
  try {
    const {
      companyName,
      concernPerson,
      email,
      mobile,
      telephone,
      website,
      comment,
      address,
      chineseCompanyName,
      chineseConcernPerson,
      chineseAddress,
      beneficiaryAddress,
      bankDetails,
    } = req.body;

    if (!companyName) {
      throw new Error("Company Name is required");
    }

    if (!concernPerson) {
      throw new Error("Concern Person is required");
    }

    if (!email) {
      throw new Error("email is required");
    }

    const isExist = await vendor.findOne({ CompanyName: companyName });

    if (isExist) {
      throw new Error("Company Name already exist");
    }

    /// generating Unique vendorId
    let vendorId = generateUniqueId({
      length: 4,
      useLetters: false,
    });

    /// Saving File
    let companyLogo = req.files && req.files.logo ? req.files.logo[0] : "";
    let companyCertificate =
      req.files && req.files.certificate ? req.files.certificate[0] : "";

    let info = {
      VendorId: `IRSVC${vendorId}`,
      CompanyName: companyName,
      ConcernPerson: concernPerson,
      Email: email,
      Mobile: mobile,
      companyLogo,
      companyCertificate,
      Tele: telephone,
      website: website,
      comment: comment,
      Address: address ? JSON.parse(address) : "",
      ChineseCompanyName: chineseCompanyName,
      ChineseConcernPerson: chineseConcernPerson,
      chineseAddress: chineseAddress ? JSON.parse(chineseAddress) : "",
      BeneficiaryAddress: beneficiaryAddress
        ? JSON.parse(beneficiaryAddress)
        : "",
      BankDetails: bankDetails ? JSON.parse(bankDetails) : "",
    };

    const result = await vendor.create(info);
    res.status(200).send({
      status: true,
      message: "Supplier registered successfully",
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const getAllVendor = async (req, res) => {
  try {
    const allVendorData = await vendor
      .find({})
      .select(
        "-companyCertificate -companyLogo -chineseAddress -ChineseConcernPerson -ChineseCompanyName -BankDetails -BeneficiaryAddress -Address -comment -Tele"
      )
      .lean();

    const allClientData = await clientUser.find({}).select("-password").lean();

    const result = allVendorData.map((vendor) => {
      return {
        ...vendor,
        clientData: allClientData.filter(
          (clientData) => clientData.VendorId === vendor.VendorId
        ),
      };
    });

 

    res.status(200).send({
      status: true,
      message: "All vendor Fetched successfully",
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};
module.exports = {
  registerVendor,
  getAllVendor,
};
