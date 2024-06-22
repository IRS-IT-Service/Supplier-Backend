const Notification = require("../model/notifications.model");

const getAllNotifications = async (req, res) => {
  try {
    const adminNotifications = await Notification.find({notificationType:"admin"});
    res.status(200).send({
      success: true,
      message: "message is sent successfully",
      data: adminNotifications,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(400).send(err.message);
  }
};

// Example method to save a notification
const saveNotification = async (req, res) => {
  const { vendorId, message, notificationType,click } = req.body;

  try {
    const info = {
      vendorId,
      message,
      notificationType,
      click
    };
  

    const notification = await Notification.create(info);
    await notification.save();

    res.json({ message: "Notification saved successfully" });
  } catch (err) {
    console.error("Error saving notification:", err);
    res.status(400).send(err.message);
  }
};

const getNotificationsByVendorId = async (req, res) => {
  const {id} = req.params;
console.log(id)
  try {
    const clientNotifications = await Notification.find({
      vendorId: id,
      notificationType: "client",
    });

    res.status(200).send({
      success: true,
      message: "Notifications retrieved successfully",
      data: clientNotifications,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).send({
      success: false,
      message: "Error fetching notifications",
      error: err.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  const id = req.params.id;

  try {
    const notification = await Notification.findOneAndDelete({ _id: id });

    if (!notification) {
      return res.status(400).send(err.message);
    }

    res.status(200).send({
      success: true,
      message: "deleted notification",
    });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(400).send(err.message);
  }
};

const deleteAllNotificationClient = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({
      success: false,
      message: "Vendor ID is required",
    });
  }

  try {
    const result = await Notification.deleteMany({
      vendorId: id,
      notificationType: "client",
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "No client notifications found to delete",
      });
    }

    res.status(200).send({
      success: true,
      message: "Client delete all notifications",
    });
  } catch (err) {
    console.error("Error deleting notifications:", err);
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};


const deleteAllNotificationAdmin = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ notificationType: "admin" });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "No admin notifications found to delete",
      });
    }

    res.status(200).send({
      success: true,
      message: "Admin delete all notifications",
    });
  } catch (err) {
    console.error("Error deleting notifications:", err);
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};


module.exports = {
  getAllNotifications,
  saveNotification,
  getNotificationsByVendorId,
  deleteNotification,
  deleteAllNotificationClient,
  deleteAllNotificationAdmin
};
