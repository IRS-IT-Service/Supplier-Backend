const transaction = require("../model/transaction.model");

const getTransactions = async (req, res) => {
  try {
    
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 50;
    const {id} = req.query
    const skip = (page - 1) * limit;
    const result = await transaction
      .find({ VendorId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
if(!result){
  throw new Error ("Transaction not Found")
}

      const total = await transaction.countDocuments({});
    res
      .status(200)
      .send({
        status: true,
        message: "Transaction fetch sucessfully",
        data: result,
        currentPage: page,
        itemCount:result.length,
        itemsPerPage: limit,
        totalItmes:Math.ceil(total),
      });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 50;

    const skip = (page - 1) * limit;

    const result = await transaction
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
      const total = await transaction.countDocuments({});

    res
      .status(200)
      .send({
        status: true,
        message: "Transaction fetch sucessfully",
        data: result,
        currentPage: page,
        itemCount:result.length,
        itemsPerPage: limit,
        totalItmes:Math.ceil(total),

      });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = { getTransactions, getAllTransactions };
