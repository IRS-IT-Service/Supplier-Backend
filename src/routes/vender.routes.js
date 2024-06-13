const {
  registerVendor,
  getAllVendor,
  getOneVendor,
  deleteVendor,
  updateVendor,
  toggleVendor
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
router.get("/getAllVendor",getAllVendor);
router.get("/getOneVendor/:id", getOneVendor);
router.delete("/deleteVendor", jwtAuthentication, deleteVendor);
router.put("/updateVendor/:id",  upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
]), updateVendor);
router.post("/toggleVendor", toggleVendor);


module.exports = router;
