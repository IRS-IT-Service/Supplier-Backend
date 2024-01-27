const express = require('express');
const router = express.Router();
const {getTransactions,getAllTransactions} = require("../controller/transaction.controller");

router.get("/getTransaction",getTransactions)
router.get("/allTransaction",getAllTransactions)


module.exports = router;