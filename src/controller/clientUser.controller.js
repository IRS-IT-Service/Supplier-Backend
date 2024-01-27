const clientUser = require("../model/clientUser.model");
const vendor = require("../model/vender.model");
const { generateToken } = require("../service/utils/generateToken");
const sendMessage = require("../commonFunction/whatsAppMessage");

const registerClientUser = async (req, res) => {
  try {
    const { vendorId, email, password, clientType } = req.body;

    if (!vendorId && !email && !password && !clientType) {
      throw new Error("Please fill all the fields");
    }

    const vendorExist = await vendor.findOne({ VendorId: vendorId });

    if (!vendorExist) {
      throw new Error("Please create vendor before creating a user");
    }
    const userExists = await clientUser.findOne({
      $or: [{ email: email }, { VendorId: vendorId }],
    });
    if (userExists) {
      if (password) {
        userExists.password = password;
      }

      userExists.clientType = clientType;
      userExists.email = email;
      await userExists.save();
      sendMessage(
        `Supplier Credential Updated for Supplier ${userExists.CompanyName}`
      );
      return res.status(201).send("ChineseUser sucessfully registered");
    }
    const result = await clientUser.create({
      VendorId: vendorId,
      password,
      email,
      CompanyName: vendorExist.CompanyName,
      clientType: clientType,
    });
    if (!result) {
      throw new Error("Invalid user data");
    }
    const update = await vendor.updateOne(
      { VendorId: vendorId },
      { $set: { isClient: true } }
    );
    res.status(201).send("ChineseUser sucessfully registered");
    sendMessage(
      `Supplier Credential Created for Supplier ${result.CompanyName}`
    );
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const authClientUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Missing Require field");
    }

    const clientUserData = await clientUser.findOne({ email });
    // console.log(clientUserData)

    if (!clientUserData) {
      throw new Error("User Not Found");
    }
    const matchPassword = await clientUserData.matchPassword(password);

    if (!matchPassword) {
      throw new Error("Invalid Password");
    }

    const vendorUserData = await vendor.findOne({
      VendorId: clientUserData.VendorId,
    });

    if (!vendorUserData.isActive) {
      throw new Error("Your account has been paushed");
    }

    const token = generateToken(clientUserData._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
    });
    const data = {
      userName: vendorUserData.ConcernPerson,
      email: clientUserData.email,
      vendorId: clientUserData.VendorId,
      clientType: clientUserData.clientType,
      CompanyName: vendorUserData.CompanyName,
      photo: vendorUserData?.companyLogo[0]?.filename,
    };
    res
      .status(200)
      .send({ status: true, message: "Login Successfull", data: data });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getAllClientUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const skip = (page - 1) * limit;

    const result = await clientUser
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await clientUser.countDocuments({});

    res.status(200).send({
      status: true,
      message: "Transaction fetch sucessfully",
      data: result,
      currentPage: page,
      itemCount: result.length,
      itemsPerPage: limit,
      totalItmes: Math.ceil(total),
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const getOneClientUser = async (req, res) => {
  try {
    const { id } = req.params;
    const clientData = await clientUser.findOne({ VendorId: id });
    const fullClientData = await vendor.findOne({ VendorId: id });
    const data = { ...clientData.toObject(), ...fullClientData.toObject() };
    if (!clientData && !fullClientData) {
      throw new Error("User not found");
    }
    res
      .status(200)
      .send({ status: true, message: "Fetch success", data: data });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

module.exports = {
  registerClientUser,
  authClientUser,
  getOneClientUser,
  getAllClientUser,
};
