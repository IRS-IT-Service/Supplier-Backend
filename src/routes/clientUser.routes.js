const {
    registerClientUser,
    authClientUser,
    getOneClientUser,
    getAllClientUser
} = require("../controller/clientUser.controller");
const express = require("express");
const router = express.Router();


router.post("/registerClientUser", registerClientUser)
router.post("/authClientUser", authClientUser);
router.get("/getOneClientUser/:id", getOneClientUser);
router.get("/getAllClientUser", getAllClientUser);

module.exports = router;