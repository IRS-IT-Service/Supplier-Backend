const conversion = require("../model/conversion.model");
const vendor = require("../model/vender.model");
const clientUser = require("../model/clientUser.model");
const generateUniqueId = require("generate-unique-id");
const transaction = require("../model/transaction.model");
const sendMessage = require("../commonFunction/whatsAppMessage");

const addConversion = async (req, res) => {
  try {
    const { USD, VendorId, RMB, ConversionRate } = req.body;

    const isClient = await clientUser.findOne({ VendorId });
    const VendorData = await vendor.findOne({ VendorId });

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
    req.io.emit("notificationAdmin", {
      type: "convertion",
      message: `USD amount ${req.body.usd} converted to ${req.body.rmb} rmb by ${VendorData.ConcernPerson}`,
    });

    await sendMessage(`USD amount ${req.body.usd} converted to ${req.body.rmb} rmb by ${VendorData.ConcernPerson}`)
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
    const total = await conversion.countDocuments({ VendorId: id });
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
  try {
    let { page = 1, limit = 50, filterById } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;
    let result;
    let total;
    if (filterById) {
      result = await conversion
        .find({ VendorId: filterById })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await conversion.countDocuments({ VendorId: filterById });
    } else {
      result = await conversion
        .find({})
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await conversion.countDocuments({});
    }

    res.status(200).send({
      status: true,
      message: "All Conversion data fetch successfully",
      page: page,
      totalCount: total,
      itemsPerPage: limit,
      currentItemsCount: result.length,
      totalPages: Math.ceil(total / limit),
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const updateConversionAdmin = async (req, res) => {
  try {
    const { status, conversionId } = req.body;

    const conversionData = await conversion.findOne({
      conversionId: conversionId,
    });

    if (conversionData.isFullfilledAdmin) {
      throw new Error("User Doesn't exist");
    }

    if (!status) {
      const result = await conversion.updateOne(
        { conversionId: conversionId },
        {
          $set: {
            isFullfilledClient: false,
            isRejected: true,
          },
        }
      );
      req.io.emit("notificationClient", {
        type: "convertion",
        vendorId: conversionData.VendorId,
        message: `Conversion of amount ${conversionData.USD} USD rejected , try converting again `,
      });
      return res.status(200).send({
        status: true,
        message: "Conversion Rejected",
      });
    }

    const clientoldBalance = await clientUser.findOne({
      VendorId: conversionData.VendorId,
    });
    const updatedUSD =
      Number(clientoldBalance.balanceUSD) - Number(conversionData.USD);
    const updatedRMB =
      Number(clientoldBalance.balanceRMB) + Number(conversionData.RMB);

    const clientUpdate = await clientUser.updateOne(
      { VendorId: conversionData.VendorId },
      {
        $set: {
          balanceUSD: updatedUSD,
          balanceRMB: updatedRMB,
        },
      }
    );
    const result = await conversion.updateOne(
      { conversionId: conversionId },
      {
        $set: {
          isFullfilledAdmin: true,
        },
      }
    );
    if (!result) {
      throw new Error("Error Occured");
    }
    let gui = generateUniqueId({
      length: 6,
      useLetters: false,
    });
    const InfoUSD = {
      transactionId: `TR${gui}`,
      VendorId: conversionData.VendorId,
      Amount: Number(conversionData.USD),
      Currency: "USD",
      type: "dr",
      PaymentMode: "conversion",
      RefId: conversionId,
      PreviosAmount: Number(clientoldBalance.balanceUSD),
      FinalAmount: updatedUSD,
    };
    let gui2 = generateUniqueId({
      length: 6,
      useLetters: false,
    });
    const InfoRMB = {
      transactionId: `TR${gui2}`,
      VendorId: conversionData.VendorId,
      Amount: Number(conversionData.RMB),
      Currency: "RMB",
      type: "cr",
      PaymentMode: "conversion",
      RefId: conversionId,
      PreviosAmount: Number(clientoldBalance.balanceRMB),
      FinalAmount: updatedRMB,
    };
    const newTransaction = await transaction.create([InfoRMB, InfoUSD]);
    req.io.emit("notificationClient", {
      type: "convertion",
      vendorId: conversionData.VendorId,
      message: `Conversion of amount ${conversionData.USD} USD accepted `,
    });

    return res.status(200).send({
      status: true,
      message: "Conversion successfully created",
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  addConversion,
  getConversion,
  getAllConvertion,
  updateConversionAdmin,
};
