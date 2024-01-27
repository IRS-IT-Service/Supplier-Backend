const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerFunction = require("../commonFunction/multerFunction");
const {
  addPaymentRMB,
  getPaymentRMB,
  getPaymentRMBById,
  verifyPaymentRMB
} = require("../controller/paymentRMB.controller");

const storage = multerFunction("paymentRMB");

const uploadStorage = multer({ storage: storage });

//Routes

router.post(
  "/addPaymentRMB",
  uploadStorage.fields([{ name: "reciept", maxCount: 1 }]),
  addPaymentRMB
);

router.get("/getPaymentRMB", getPaymentRMB);
router.get("/getPaymentRMBById",getPaymentRMBById);
router.post("/verifyPaymentRMB",verifyPaymentRMB);

module.exports = router;
