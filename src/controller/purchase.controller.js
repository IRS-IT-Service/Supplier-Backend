const purchase = require("../model/purchase.model");
const vendor = require("../model/vender.model");
const clientUser = require("../model/clientUser.model");
const generateUniqueId = require("generate-unique-id");
const transaction = require("../model/transaction.model");

const addPurchase = async (req, res) => {
  try {
    const { VendorId, type, PaymentAmount, PaidTo, Date, Description } =
      req.body;
    const isClient = await clientUser.findOne({ VendorId });
    const vendorData = await vendor.findOne({ VendorId });
    if (!isClient) {
      throw new Error("client doesnt exist");
    }
    if (isClient.clientType === "RMBandUSD") {
      if (isClient.balanceRMB < req.body.paymentAmount) {
        throw new Error("insufficient Balance ");
      }
    }

    if (isClient.clientType === "USD") {
      if (isClient.balanceUSD < req.body.paymentAmount) {
        throw new Error("insufficient Balance ");
      }
    }

    const file = req.files && req.files.file ? req.files.file[0].filename : "";

    let gui = generateUniqueId({
      length: 5,
      useLetters: false,
    });

    let info = {
      VendorId,
      type,
      PaymentAmount,
      PaidTo,
      Date: Date,
      Description,
      PurchaseId: `PCH${gui}`,
      file,
    };

    const purchaseData = await purchase.create(info);

    if (!purchaseData) {
      throw new Error("Failed to create purchase");
    }
    if (purchaseData) {
      if (isClient.clientType === "RMBandUSD") {
        const balanceDeductRMB = await clientUser.updateOne(
          { VendorId },
          {
            $set: {
              balanceRMB: Number(isClient.balanceRMB) - Number(PaymentAmount),
            },
          }
        );

        if (balanceDeductRMB) {
          let gui = generateUniqueId({
            length: 6,
            useLetters: false,
          });
          const tInfo = {
            transactionId: `TR${gui}`,
            VendorId,
            Amount: Number(PaymentAmount),
            Currency: "RMB",
            type: "dr",
            RefId: purchaseData.PurchaseId,
            PaymentMode: "purchase",
            PreviosAmount: Number(isClient.balanceRMB),
            FinalAmount: Number(isClient.balanceRMB) - Number(PaymentAmount),
          };
          const newTransaction = await transaction.create(tInfo);
        }
      } else if (isClient.clientType === "USD") {
        const balanceDeductUSD = await clientUser.updateOne(
          { VendorId },
          {
            $set: {
              balanceUSD: Number(isClient.balanceUSD) - Number(PaymentAmount),
            },
          }
        );
        if (balanceDeductUSD) {
          let gui2 = generateUniqueId({
            length: 6,
            useLetters: false,
          });
          const tInfoUSD = {
            transactionId: `TR${gui2}`,
            VendorId,
            Amount: Number(PaymentAmount),
            Currency: "USD",
            type: "dr",
            RefId: purchaseData.PurchaseId,
            PaymentMode: "purchase",
            PreviosAmount: Number(isClient.balanceUSD),
            FinalAmount: Number(isClient.balanceUSD) - Number(PaymentAmount),
          };

          const newTransaction = await transaction.create(tInfoUSD);
        }
      }
    }

    res.status(200).send({
      sucess: true,
      message: "purchase created",
      data: purchaseData,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getPurchase = async (req, res) => {
  try {
    const { id } = req.query;
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    if (!id) {
      throw new Error("please add vendor id to get the payments");
    }
    const resultOther = await purchase
      .find({
        VendorId: id,
        type: "other",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const resultSelf = await purchase
      .find({
        VendorId: id,
        type: "self",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await purchase.countDocuments({ VendorId: id });

    let info = {
      other: resultOther,
      self: resultSelf,
    };
    res.status(200).send({
      status: true,
      message: "Purchase fetch successfully",
      data: info,
      currentPage: page,
      itemCountSelf: resultSelf.length,
      itemCountOther: resultOther.length,
      itemsPerPage: limit,
      totalItems: Math.ceil(total),
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getClientPurchase = async (req, res) => {
  try {
    const { id } = req.query;
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    if (!id) {
      throw new Error("please ad vendor id to get the payments");
    }

    const resultOther = await purchase
      .find({
        VendorId: id,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await purchase.countDocuments({ VendorId: id });
    res.status(200).send({
      status: true,
      message: "Purchase fetch successfully",
      data: resultOther,
      currentPage: page,
      itemCount: resultOther.length,
      itemsPerPage: limit,
      totalItems: Math.ceil(total),
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const getAllPurchase = async (req, res) => {
  try {
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const result = await purchase
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await purchase.countDocuments({});
    res.status(200).send({
      status: true,
      message: "All purchase data fetch successfully",
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

const getOnePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error("please ad purchase id to get the payments");
    }
    const result = await purchase.findOne({
      PurchaseId: id,
    });
    res
      .status(200)
      .send({
        status: true,
        message: "Purchase data fetch successfully",
        data: result,
      });
  } catch (err) {
    res.status(400).send(err);
  }
};

const rejectPurchase = async (req, res) => {
    try {
      const { id } = req.params;
      const purchaseData = await purchase.findOne({ PurchaseId: id });
  
      if (!purchaseData) {
        throw new Error("Invalid data");
      }
  
      const result = await purchase.findOneAndUpdate(
        { PurchaseId: id },
        { $set: { status: "Rejected" } },
        { new: true }
      );
  
      const VendorData = await clientUser.findOne({ VendorId: purchaseData.VendorId });
  
      if (VendorData.clientType === "RMBandUSD") {
        const balanceAddRMB = await clientUser.findOneAndUpdate(
          { VendorId: purchaseData.VendorId },
          {
            $set: {
              balanceRMB: Number(VendorData.balanceRMB) + Number(purchaseData.PaymentAmount),
            },
          }
        );
      } else if (VendorData.clientType === "USD") {
        const balanceAddUSD = await clientUser.findOneAndUpdate(
          { VendorId: purchaseData.VendorId },
          {
            $set: {
              balanceRMB: Number(VendorData.balanceRMB) + Number(purchaseData.PaymentAmount),
            },
          }
        );
      }
  
      const removeTransaction = await transaction.findOneAndDelete({
        RefId: purchaseData.PurchaseId,
      });
  
      res.status(200).send({ status: true, message: "Reject successfully", data: result });
    } catch (err) {
      console.error(err);
      res.status(400).send({ status: false, message: err.message });
    }
  };
  

module.exports = {
  addPurchase,
  getPurchase,
  getClientPurchase,
  getAllPurchase,
  getOnePurchase,
  rejectPurchase
  
};
