const {
  registerVendor,
  getAllVendor,
} = require("../controller/vendor.controller");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerFunction = require("../commonFunction/multerFunction");
const { jwtAuthentication } = require("../middleware/authMiddleware");

const storage = multerFunction("Vendor");

const upload = multer({ storage: storage });

router.post(
  "/registerVendor",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  registerVendor
);
router.get("/getAllVendor", jwtAuthentication, getAllVendor);

module.exports = router;
