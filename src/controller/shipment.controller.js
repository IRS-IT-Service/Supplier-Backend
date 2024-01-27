const shipment = require("../model/shipment.model");
const vendor = require("../model/vender.model");
const clientUser = require("../model/clientUser.model");

const addShipment = async (req, res) => {
  try {
    const { VendorId, TrackingId, CourierName, NoOfBoxes, remark, BoxDetails } =
      req.body;
    const isClient = await clientUser.findOne({ VendorId });
    if (!isClient) {
      throw new Error("client doesnt exist");
    }
    const vendorData = await vendor.findOne({ VendorId });
    const isTrackingId = await shipment.findOne({
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
    const shipmentData = await shipment.create(info);
    if (!shipmentData) {
      throw new Error("shipment creation failed");
    }

    res.status(200).send({
      status: true,
      message: "Shipment create successfully ",
      data: shipmentData,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getShipment = async (req, res) => {
  try {
    const { id } = req.query;
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const shipmentData = await shipment
      .find({ VendorId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!shipmentData) {
      throw new Error("No shipment exist");
    }
    const total = await shipment.countDocuments({ VendorId: id });
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
    console.log(err);
    res.status(400).send(err.message);
  }
};

const getAllShipment = async (req, res) => {
  try {
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const shipmentData = await shipment
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!shipmentData) {
        throw new Error("No shipment exist");
    }
    const total = await shipment.countDocuments({});

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

const verifyShipment = async (req, res) => {
    try {

      const { isReject ,TrackingId } = req.body;
      const shipmentData = await shipment.findOne({ TrackingId});
      if (isReject) {
        const shipmentUpdate = await shipment.findOneAndUpdate(
          { TrackingId},
          {
            $set: {
              isRejected: true,
            },
          }
        );
       
        return res.status(200).send({status:true ,message:"shipment rejected successfully"});
      }
  
      const shipmentUpdate = await shipment.findOneAndUpdate(
        { TrackingId},
        {
          $set: {
            isFullfilled: !isReject,
          },
        }
      );

      if(!shipmentUpdate){
        throw new Error("Shipment not found")
      }
    
      res.status(200).send({status:true,message:"Shipment update successfully",data:shipmentUpdate});
    } catch (err) {
 
      res.status(400).send(err.message);
    }
  };
  
  const getOneShipment = async (req, res) => {
    try {
      const { id } = req.params;
      const shipmentData = await shipment.findOne({ TrackingId: id });
  
      if (!shipmentData) {
        throw new Error("No shipment exist");
      }
  
      res.status(200).send({status:true,message:"Shipment fetch successfully",data:shipmentData});
    } catch (err) {
      console.log(err);
      res.status(400).send(err.message);
    }
  };

module.exports = {
  addShipment,
  getShipment,
  getAllShipment,
  getOneShipment,
  verifyShipment
};
