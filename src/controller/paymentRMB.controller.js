const paymentRMB = require("../model/paymentRMB.model");
const clientUser = require("../model/clientUser.model");
const generateUniqueId = require("generate-unique-id");
const transaction = require("../model/transaction.model");

const addPaymentRMB = async (req, res) => {
  const { VendorId, paymentAmount, description } = req.body;
  const { reciept } = req.files;

  try {
    const isClient = await clientUser.findOne({ VendorId });
    console.log(isClient);
    const gui = generateUniqueId({
      length: 6,
      useLetters: false,
    });
    const recieptFile = reciept ? reciept[0].filename : "";

    if (!isClient) {
      throw new Error("Client not exist" );
    }

    let info = {
      VendorId: VendorId,
      PaymentId: `RM${gui}`,
      PaymentAmount: paymentAmount,
      PaymentDate: Date.now(),
      Description: description,
      Reciept: recieptFile,
    };
    const paymentData = await paymentRMB.create(info);
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
 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const payments = await paymentRMB.find({}).sort({ createdAt: -1 }).skip(skip)
    .limit(limit);
    const total = await paymentRMB.countDocuments({});


    res.status(200).send({
      status: true,
      message: "PaymentRMB data retrieved successfully",
      data: payments,
      currentPage: page,
      itemCount:payments.length,
      itemsPerPage: limit,
      totalItems:Math.ceil(total),
    });
  } catch (e) {
    res.status(400).send(e.message);
  }
};
// Get payment by Id

const getPaymentRMBById = async (req, res) => {
  try {

    const { VendorId } = req.query;

    const page = parseInt(req.query.page) + 1 ;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const payments = await paymentRMB.find({ VendorId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    console.log(payments)
if(!payments){
  throw new Error("Payment info not found")
}
    const total = await paymentRMB.countDocuments({VendorId});

    res.status(200).send({
      success: true,
      message: "PaymentRMB data retrieved successfully",
      data: payments,
      currentPage: page,
      itemCount:payments.length,
      itemsPerPage: limit,
      totalItems:Math.ceil(total),
    });
  } catch (e) {
    res.status(400).send(e.message);
  }
};

//get verify payment rmb
const verifyPaymentRMB = async (req, res) => {
  try {
    const { VendorId, PaymentId, status } = req.body;


    const isClient = await clientUser.findOne({ VendorId });
    const isVerifiy = await paymentRMB.findOne({ PaymentId });
    if (!isClient) {
      throw new Error ("client doesn't exist" );
    }
    if (isVerifiy.isFullfilled) {
      throw new Error ( "Payment already accepted" );
    }

    if (status) {
      const paymentData = await paymentRMB.findOneAndUpdate(
        { PaymentId: PaymentId },
        { $set: { isFullfilled: true } },
        { new: true }
      );

      
   
      const clientUpdate = await clientUser.updateOne(
        { VendorId: VendorId },
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
          VendorId: VendorId,
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
        res
          .status(200)
          .send({ sucess: true, message: "Payment RMB Successfully Accepted" });
      } else {
        res.status(200).send({
          sucess: true,
          message: "PaymentRMB rejected",
        });
      }
    }
  } catch (err) {
    res.status(400).send(err.message)
  }
};

module.exports = {
  addPaymentRMB,
  getPaymentRMB,
  getPaymentRMBById,
  verifyPaymentRMB
};
