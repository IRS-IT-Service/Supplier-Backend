const adminShipment = require("../model/adminShipment.model");
const clientUser = require("../model/clientUser.model");
const vendor = require("../model/vender.model");

const addAdminShipment = async (req, res) => {
  try {
    const { VendorId, TrackingId, CourierName, NoOfBoxes, remark, BoxDetails } =
      req.body;
    const isClient = await clientUser.findOne({ VendorId });
    if (!isClient) {
      throw new Error("Client doesn't exist");
    }
    const isTrackingId = await adminShipment.findOne({
      TrackingId,
    });

    if (isTrackingId) {
      throw new Error("Tracking Id already exist");
    }

    const file =
      req.files && req.files.file
        ? req.files.file.map((item) => {
            return item.filename;
          })
        : [];
    let info = {
      VendorId,
      TrackingId,
      CourierName,
      NoOfBoxes,
      remark,
      BoxDetails: JSON.parse(BoxDetails),
      file,
    };
    const shipmentData = await adminShipment.create(info);
    if (!shipmentData) {
      throw new Error("shipment creation failed");
    }
    res.status(200).send({
      status: true,
      message: "Shipment created successfully",
      data: shipmentData,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// const getAllAdminShipment = async (req, res) => {
//   try {
//     const { id } = req.query;
//     const page = parseInt(req.query.page) + 1 ;
//     const limit = parseInt(req.query.limit) || 12;
//     const skip = (page - 1) * limit;
    
    
//     const shipmentData = await adminShipment.find().sort({ updatedAt: -1 });

//     if (!shipmentData) {
//       return res.status(400).send("No shipment exist");
//     }

//     res.status(200).send(shipmentData);
//   } catch (err) {
//     console.log(err);
//     res.status(400).send(err);
//   }
// };

const getOneAdminShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipmentData = await adminShipment.findOne({ TrackingId: id });

    if (!shipmentData) {
      throw new Error("No shipment exist!");
    }

    res.status(200).send({status:true,message:"Shipment fetch successfully",data:shipmentData});
  } catch (err) {

    res.status(400).send(err.message);
  }
};



const getVendorAdminShipment = async (req, res) => {
  try {
    const { id } = req.query;
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const shipmentData = await adminShipment
      .find({ VendorId: id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await adminShipment.countDocuments({ VendorId: id });

    if (!shipmentData) {
      throw new Error("No shipment exist");
    }

    res.status(200).send({
      status: true,
      message: "Shipment fetch successfully",
      data: shipmentData,
      currentPage: page,
      itemCount: shipmentData.length,
      itemsPerPage: limit,
      totalItems: Math.ceil(total),
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = { addAdminShipment, getVendorAdminShipment,getOneAdminShipment };
