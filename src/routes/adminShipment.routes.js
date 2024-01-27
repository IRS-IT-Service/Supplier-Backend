const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerFunction = require("../commonFunction/multerFunction");
const {
  addAdminShipment,
  getVendorAdminShipment,
  getOneAdminShipment
} = require("../controller/adminShipment.controller");

const storage = multerFunction("adminShipment");

const uploadStorage = multer({ storage: storage });

router.post('/addAdminShipment',uploadStorage.fields([{name:"file",maxCount:1}]),addAdminShipment)

router.get("/getVendorAdminShipment",getVendorAdminShipment)
router.get("/getOneAdminShipment/:id",getOneAdminShipment)

module.exports = router;