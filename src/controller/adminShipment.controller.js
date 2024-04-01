const adminShipment = require("../model/adminShipment.model");
const clientUser = require("../model/clientUser.model");
const vendor = require("../model/vender.model");
const sendMessage = require("../commonFunction/whatsAppMessage");

const addAdminShipment = async (req, res) => {
  try {
    const { VendorId, TrackingId, CourierName, NoOfBoxes, remark, BoxDetails } =
      req.body;
    
    const isClient = await clientUser.findOne({ VendorId });
    console.log(isClient)
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
    req.io.emit("notificationClient", {
      type: "recievedShipment",
      vendorId: req.body.VendorId,
      message: `shipment created with tracking id ${req.body.TrackingId}`,
    });
    res.status(200).send({
      status: true,
      message: "Shipment created successfully",
      data: shipmentData,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getAllAdminShipment = async (req, res) => {
  try {
    let { page = 1, limit = 12 } = req.query;
     page = parseInt(page);
     limit = parseInt(limit) ;
    const skip = (page - 1) * limit;

    const shipmentData = await adminShipment
      .find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!shipmentData) {
      throw new Error("No shipment exist !");
    }
    const total = await adminShipment.countDocuments({});
    res.status(200).send({
      status: true,
      message: "Payment data fetch successfully",
      data: shipmentData,
      page: page,
      totalCount: total,
      itemsPerPage: limit,
      // currentItemsCount: result.length,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOneAdminShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipmentData = await adminShipment.findOne({ TrackingId: id });

    if (!shipmentData) {
      throw new Error("No shipment exist !");
    }

    res.status(200).send({
      status: true,
      message: "Shipment fetch successfully",
      data: shipmentData,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getVendorAdminShipment = async (req, res) => {
  try {
    const { id } = req.query;
    const page = parseInt(req.query.page) + 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const shipmentData = await adminShipment
      .find({ VendorId: id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
console.log(shipmentData)
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

const verifyAdminShipment = async (req, res) => {
  try {
    const { status ,TrackingId } = req.body;

if(!TrackingId){
  throw new Error("Shipment not found !")
}

    const shipmentData = await adminShipment.findOne({ TrackingId});
    const vendorData = await vendor.findOne({
      VendorId: shipmentData.VendorId,
    });
    const shipmentUpdate = await adminShipment.findOneAndUpdate(
      { TrackingId },
      {
        $set: {
          isFullfilled: status,
        },
      }
    );
    req.io.emit("notificationAdmin", {
      type: "Shipment",
      message: `shipment with tracking id ${id} accepted by ${vendorData.ConcernPerson}`,
    });

    await sendMessage(`Shipment with tracking id ${id} accepted by ${vendorData.ConcernPerson}`)

    res.status(200).send({status:true ,message:"Shipment updated successfully"});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  addAdminShipment,
  getVendorAdminShipment,
  getOneAdminShipment,
  getAllAdminShipment,
  verifyAdminShipment
};
