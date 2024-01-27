const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerFunction = require("../commonFunction/multerFunction");
const {
  addShipment,
  getShipment,
  getAllShipment,
  getOneShipment,
  verifyShipment,
} = require("../controller/shipment.controller");

const storage = multerFunction("shipment");

let upload = multer({ storage: storage });
router.post(
  "/addShipment",
  upload.fields([{ name: "file", maxCount: 1 }]),
  addShipment
);
router.get("/getShipment", getShipment);
router.get("/getAllShipment", getAllShipment);
router.get("/getOneShipment/:id", getOneShipment);
router.post("/verifyShipment", verifyShipment);

module.exports = router;
