const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerFunction = require("../commonFunction/multerFunction");
const {addConversion,getAllConvertion,getConversion} = require("../controller/conversion.controller")

const storage = multerFunction("conversion");

const uploadStorage = multer({ storage: storage });


router.post(
    "/addConversion",
    uploadStorage.fields([{ name: "file", maxCount: 1 }]),
    addConversion
  );
  router.get("/getConversion", getConversion);
  router.get("/getAllConvertion",getAllConvertion);
  module.exports = router;