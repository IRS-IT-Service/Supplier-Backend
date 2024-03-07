const payment = require("../model/payment.model");
const vendor = require("../model/vender.model");
const transaction = require("../model/transaction.model");
const clientUser = require("../model/clientUser.model");
const generateUniqueId = require("generate-unique-id");
const sendMessage = require("../commonFunction/whatsAppMessage");


//Add payment

const addPayment = async (req, res) => {
  try {
    const { VendorId, ReferenceId, PI_no, PaymentAmount, PaymentDate } =
      req.body;
    const isClient = await clientUser.findOne({ VendorId });

    if (!isClient) {
      throw new Error("client doesnt exist");
    }

    const swiftFile =
      req.files && req.files.swiftFile ? req.files.swiftFile[0].filename : "";
    const piFile =
      req.files && req.files.piFile ? req.files.piFile[0].filename : "";

    const isReference = await payment.findOne({
      ReferenceId,
    });

    const isPI = await payment.findOne({
      PI_no,
    });

    if (isReference || isPI) {
      throw new Error("Refrence or PI  already exist");
    }

    let info = {
      VendorId,
      PaymentAmount,
      PaymentDate,
      ReferenceId,
      PI_no,
      swiftFile,
      piFile,
    };

    const paymentData = await payment.create(info);
    res
      .status(200)
      .send({ status: true, message: "Payment successfully done" });

    if (!paymentData) {
      throw new Error("Failed to create payment");
    }
    req.io.emit("notificationClient", {
      type: "remittance",
      vendorId: VendorId,
      message: `Remittance Created of amount $ ${PaymentAmount}`,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getPayments = async (req, res) => {
  try {
    const { id } = req.query;
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    if (!id) {
      throw new Error("please add vendor id to get the payments");
    }
    const result = await payment
      .find({ VendorId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await payment.countDocuments({ VendorId: id });

    if (!result) {
      throw new Error("Payment not found");
    }
    res.status(200).send({
      status: true,
      message: "Payment data fetch successfully",
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

const getAllPayment = async (req, res) => {
  try {
    let { page = 1, limit = 50, filterById } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;
    let result;
    let total;
    if (filterById) {
      result = await payment
        .find({ VendorId: filterById })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await payment.countDocuments({ VendorId: filterById });
    } else {
      result = await payment
        .find({})
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await payment.countDocuments({});
    }

    res.status(200).send({
      status: true,
      message: "All Payment data fetch successfully",
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

//update payment
const updatePaymentClient = async (req, res) => {
  try {
    const { ReferenceId, usd } = req.body;
    const RecievedFile =
      req.files && req.files.file ? req.files.file[0].filename : "";

    const paymentData = await payment.findOne({ ReferenceId });
    const vendorData = await vendor.findOne({ VendorId: paymentData.VendorId });
    if (usd > paymentData.PaymentAmount) {
      throw new Error("Invalid payment amount");
    }

    if (!ReferenceId || !usd) {
      throw new Error(
        "please add reference id and usd amount to update the payments"
      );
    }
    if (!RecievedFile) {
      throw new Error("please add receipt");
    }

    const result = await payment.updateOne(
      { ReferenceId },
      {
        $set: {
          PaymentRecievedUSD: usd,
          PaymentRecievedDate: new Date(),
          isFullfilledClient: true,
          isRetry: false,
          RecievedFile,
        },
      }
    );
    req.io.emit("notificationAdmin", {
      type: "RemittanceList",
      message: `Remittance no ${paymentData.ReferenceId} Recieved by ${vendorData.ConcernPerson}`,
    });
    await sendMessage(`Remittance no ${paymentData.ReferenceId} Recieved by ${vendorData.ConcernPerson}`)
    res
      .status(200)
      .send({ status: true, message: "Payment received successfully" });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//update Admin paymnet

const updatePaymentAdmin = async (req, res) => {
  try {
    const { referenceId, status } = req.body;

    if (!referenceId) {
      throw new Error("Please add ReferenceId");
    }

    if (!status) {
      const result = await payment.findOneAndUpdate(
        { ReferenceId: referenceId },
        {
          $set: {
            isFullfilledClient: false,
            isRetry: true,
          },
        }
      );
      req.io.emit("notificationClient", {
        type: "remittance",
        vendorId: result.VendorId,
        message: `Remittance ${referenceId} rejected `,
      });
      return res
        .status(200)
        .send({ status: true, message: "Payment Rejected successfully" });
    }

    const paymentUSD = await payment.findOne({ ReferenceId: referenceId });

    if (!paymentUSD) {
      throw new Error("Reference not found");
    }

    const clientoldBalance = await clientUser.findOne({
      VendorId: paymentUSD.VendorId,
    });

    const clientUpdate = await clientUser.findOneAndUpdate(
      { VendorId: paymentUSD.VendorId },
      {
        $set: {
          balanceUSD:
            Number(clientoldBalance.balanceUSD) +
            Number(paymentUSD.PaymentRecievedUSD),
        },
      }
    );
    const result = await payment.findOneAndUpdate(
      { ReferenceId: referenceId },
      {
        $set: {
          isFullfilledAdmin: true,
        },
      }
    );
    if (result) {
      let gui = generateUniqueId({
        length: 6,
        useLetters: false,
      });
      const tInfo = {
        transactionId: `TR${gui}`,
        VendorId: paymentUSD.VendorId,
        Amount: Number(paymentUSD.PaymentRecievedUSD),
        Currency: "USD",
        type: "cr",
        PaymentMode: "payment",
        RefId: referenceId,
        PreviosAmount: Number(clientoldBalance.balanceUSD),
        FinalAmount:
          Number(clientoldBalance.balanceUSD) +
          Number(paymentUSD.PaymentRecievedUSD),
      };
      const newTransaction = await transaction.create(tInfo);
    }
    req.io.emit("notificationClient", {
      type: "remittance",
      vendorId: paymentUSD.VendorId,
      message: `Remittance ${referenceId} Accepted`,
    });

    return res
      .status(200)
      .send({ status: true, message: "Payment Verify successfully" });
  } catch (err) {
    res.send(400).send(err);
  }
};

module.exports = {
  addPayment,
  getAllPayment,
  getPayments,
  updatePaymentClient,
  updatePaymentAdmin,
};
