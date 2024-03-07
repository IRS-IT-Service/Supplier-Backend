const shipment = require("../model/shipment.model");
const vendor = require("../model/vender.model");
const clientUser = require("../model/clientUser.model");
const sendMessage = require("../commonFunction/whatsAppMessage");

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
    req.io.emit("notificationAdmin", {
      type: "Shipment",
      time:new Date(),
      message: `Shipment created by ${vendorData.ConcernPerson}`,
    });

    await sendMessage(`Shipment created by ${vendorData.ConcernPerson}`)

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
    let { page = 1, limit = 50, filterById } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const shipmentData = await shipment
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    let result;
    let total;
    if (filterById) {
      result = await shipment
        .find({ VendorId: filterById })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await shipment.countDocuments({ VendorId: filterById });
    } else {
      result = await shipment
        .find({})
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await shipment.countDocuments({});
    }

    res.status(200).send({
      status: true,
      message: "Shipment fetch successfully",
      page: page,
      totalCount: total,
      itemsPerPage: limit,
      currentItemsCount: result.length,
      totalPages: Math.ceil(total / limit),
      data: result,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const verifyShipment = async (req, res) => {
  try {
    const { status, trackingId } = req.body;

    if (typeof status !== "boolean" || !trackingId) {
      throw new Error("status and trackingId are required");
    }
    const shipmentData = await shipment.findOne({ TrackingId: trackingId });
    if (!shipmentData) {
      throw new Error("No shipment exist");
    }
    if (status === false) {
      const shipmentUpdate = await shipment.findOneAndUpdate(
        { TrackingId: trackingId },
        {
          $set: {
            isRejected: true,
          },
        }
      );
      req.io.emit("notificationClient", {
        type: "shipment",
        vendorId: shipmentData.VendorId,
        message: `Shipment with tracking id ${id} rejected`,
      });
      return res
        .status(200)
        .send({ status: true, message: "shipment rejected successfully" });
    }

    const shipmentUpdate = await shipment.findOneAndUpdate(
      { TrackingId: trackingId },
      {
        $set: {
          isFullfilled: true,
        },
      }
    );
    req.io.emit("notificationClient", {
      type: "shipment",
      vendorId: shipmentData.VendorId,
      message: `Shipment with tracking id ${id} accepted`,
    });
    res.status(200).send({
      status: true,
      message: "Shipment update successfully",
    });
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

    res.status(200).send({
      status: true,
      message: "Shipment fetch successfully",
      data: shipmentData,
    });
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
  verifyShipment,
};
