const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerFunction = require("../commonFunction/multerFunction");

const { addPurchase,getPurchase,getClientPurchase ,getAllPurchase,getOnePurchase,rejectPurchase } = require("../controller/purchase.controller");
const storage = multerFunction("purchase");

const uploadStorage = multer({ storage: storage });

router.post(
  "/addPurchase",
  uploadStorage.fields([{ name: "file", maxCount: 1 }]),
  addPurchase
);

router.get("/getPurchase",getPurchase)
router.get("/getAllPurchase",getAllPurchase)
router.get("/getClientPurchase",getClientPurchase)
router.get("/getOnePurchase/:id",getOnePurchase)
router.get("/rejectPurchase/:id",rejectPurchase)

module.exports = router;
