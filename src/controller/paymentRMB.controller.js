const paymentRMB = require("../model/paymentRMB.model");
const clientUser = require("../model/clientUser.model");
const generateUniqueId = require("generate-unique-id");
const transaction = require("../model/transaction.model");
const sendMessage = require("../commonFunction/whatsAppMessage");
const vendor = require("../model/vender.model");

const addPaymentRMB = async (req, res) => {
  const { vendorId, paymentAmount, description } = req.body;
  const { reciept } = req.files;

  try {
    const isClient = await clientUser.findOne({ VendorId: vendorId });

    const gui = generateUniqueId({
      length: 6,
      useLetters: false,
    });
    const recieptFile = reciept ? reciept[0].filename : "";

    if (!isClient) {
      throw new Error("Client not exist");
    }

    let info = {
      VendorId: vendorId,
      PaymentId: `RM${gui}`,
      PaymentAmount: paymentAmount,
      PaymentDate: Date.now(),
      Description: description,
      Reciept: recieptFile,
    };
    const paymentData = await paymentRMB.create(info);
    req.io.emit("notificationClient", {
      type: "PaymentRmb",
      vendorId: vendorId,
      message: `Remittance Created of amount ¥ ${paymentAmount}`,
    });
    res.status(200).send({
      sucess: true,
      message: "Payment RMB created successfully",
      data: paymentData,
    });
  } catch (e) {
    res.status(400).send(e.message);
  }
};

//Get payment

const getPaymentRMB = async (req, res) => {
  try {
    let { page = 1, limit = 50, filterById } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;
    let result;
    let total;
    if (filterById) {
      result = await paymentRMB
        .find({ VendorId: filterById })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await paymentRMB.countDocuments({ VendorId: filterById });
    } else {
      result = await paymentRMB
        .find({})
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await paymentRMB.countDocuments({});
    }

    res.status(200).send({
      status: true,
      message: "All Payment RMB data fetch successfully",
      page: page,
      totalCount: total,
      itemsPerPage: limit,
      currentItemsCount: result.length,
      totalPages: Math.ceil(total / limit),
      data: result,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};
// Get payment by Id

const getPaymentRMBById = async (req, res) => {
  try {
    const { VendorId } = req.query;

    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const payments = await paymentRMB
      .find({ VendorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!payments) {
      throw new Error("Payment info not found");
    }
    const total = await paymentRMB.countDocuments({ VendorId });

    res.status(200).send({
      success: true,
      message: "PaymentRMB data retrieved successfully",
      data: payments,
      currentPage: page,
      itemCount: payments.length,
      itemsPerPage: limit,
      totalItems: Math.ceil(total),
    });
  } catch (e) {
    res.status(400).send(e.message);
  }
};

//get verify payment rmb
const verifyPaymentRMB = async (req, res) => {
  try {
    const { PaymentId, status } = req.body;

    const isVerifiy = await paymentRMB.findOne({ PaymentId });
    const isClient = await clientUser.findOne({ VendorId: isVerifiy.VendorId });
    const VendorData = await vendor.findOne({ VendorId:isVerifiy.VendorId });
    if (!isClient) {
      throw new Error("client doesn't exist");
    }
    if (isVerifiy.isFullfilled) {
      throw new Error("Payment already accepted");
    }

    if (status) {
      const paymentData = await paymentRMB.findOneAndUpdate(
        { PaymentId: PaymentId },
        { $set: { isFullfilled: true } },
        { new: true }
      );

      const clientUpdate = await clientUser.updateOne(
        { VendorId: isVerifiy.VendorId },
        {
          $set: {
            balanceRMB:
              Number(isClient.balanceRMB) + Number(paymentData.PaymentAmount),
          },
        }
      );

      if (clientUpdate) {
        let gui = generateUniqueId({
          length: 6,
          useLetters: false,
        });
        const tInfo = {
          transactionId: `TR${gui}`,
          VendorId: isVerifiy.VendorId,
          Amount: Number(paymentData.PaymentAmount),
          Currency: "RMB",
          type: "cr",
          PaymentMode: "paymentRMB",
          RefId: paymentData.PaymentId,
          PreviosAmount: Number(isClient.balanceRMB),
          FinalAmount:
            Number(isClient.balanceRMB) + Number(paymentData.PaymentAmount),
        };
        const newTransaction = await transaction.create(tInfo);
      
        req.io.emit("notificationAdmin", {
          type: "AddRMB",
          vendorId: isVerifiy.VendorId,
          message: `PaymentId: ${PaymentId} amount ${paymentData.PaymentAmount} accepted by ${isVerifiy.VendorId}`,
        });
        await sendMessage(`PaymentId: ${PaymentId} amount ${paymentData.PaymentAmount} accepted by ${VendorData.ConcernPerson}` )
        res
          .status(200)
          .send({ sucess: true, message: "Payment RMB Successfully Accepted" });
      }
    } else {
      const paymentData = await paymentRMB.findOneAndUpdate(
        { PaymentId: PaymentId },
        { $set: { isRejected: true } },
        { new: true }
      );

      return res.status(200).send({
        sucess: true,
        message: "PaymentRMB rejected",
      });
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  addPaymentRMB,
  getPaymentRMB,
  getPaymentRMBById,
  verifyPaymentRMB,
};
