const express = require("express");
const router = express.Router();
const multerFunction = require("../commonFunction/multerFunction");
const multer = require("multer");
const {
  addPayment,
  getAllPayment,
  getPayments,
  updatePaymentClient,
  updatePaymentAdmin
} = require("../controller/payment.controller");

const storage = multerFunction("payment");

const uploadStorage = multer({ storage: storage });

router.post(
  "/addPayment",
  uploadStorage.fields([
    { name: "swiftFile", maxCount: 1 },
    { name: "piFile", maxCount: 1 },
  ]),
  addPayment
);
router.post(
  "/updatePaymentClient",
  uploadStorage.fields([{ name: "file", maxCount: 1 }]),
  updatePaymentClient
);
router.post("/updatePaymentAdmin",updatePaymentAdmin)
router.get("/getPayments", getPayments);
router.get("/getAllPayment", getAllPayment);

module.exports = router;
