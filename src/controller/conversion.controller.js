const conversion = require("../model/conversion.model");
const vendor = require("../model/vender.model");
const clientUser = require("../model/clientUser.model");
const generateUniqueId = require("generate-unique-id");
const transaction = require("../model/transaction.model");

const addConversion = async (req, res) => {
  try {
    const { USD, VendorId, RMB, ConversionRate } = req.body;

    const isClient = await clientUser.findOne({ VendorId });

    if (!isClient) {
      throw new Error("User Doesn't exist");
    } else if (isClient.balanceUSD < USD) {
      throw new Error("Insufficient Balance");
    }
    let gui = generateUniqueId({
      length: 5,
      useLetters: false,
    });
    const File = req.files && req.files.file ? req.files.file[0].filename : "";
    const conversionId = `CV${gui}`;
    let info = {
      VendorId,
      USD,
      RMB,
      ConversionRate,
      File,
      conversionId,
    };

    const result = await conversion.create(info);
    res.status(200).send({
      status: true,
      message: "Conversion successfully created",
      result,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getConversion = async (req, res) => {
  try {
    const { id } = req.query;
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    if (!id) {
      throw new Error("please add vendor id to get the payments");
    }
    const result = await conversion
      .find({ VendorId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await conversion.countDocuments({VendorId: id});
    if (!result) {
      throw new Error("Conversion not found for this vendor");
    }
    console.log(result);
    res.status(200).send({
      status: true,
      message: "Conversion fetch successfully",
      data: result,
      currentPage: page,
      itemCount: result.length,
      itemsPerPage: limit,
      totalItems: Math.ceil(total),
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getAllConvertion = async (req, res) => {
  const page = parseInt(req.query.page) + 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  try {
    const result = await conversion
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await conversion.countDocuments({});
    res.status(200).send({
      status: true,
      message: "Conversion fetch successfully",
      data: result,
      currentPage: page,
      itemCount: result.length,
      itemsPerPage: limit,
      totalItems: Math.ceil(total),
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

module.exports = { addConversion, getConversion, getAllConvertion };
