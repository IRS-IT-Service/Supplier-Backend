const express = require("express");
const router = express.Router();
const {
  getAllNotifications,
  saveNotification,
  getNotificationsByVendorId,
  deleteNotification,
  deleteAllNotificationClient,
  deleteAllNotificationAdmin
} = require("../controller/notifications.controller");

// User routes

// Notification routes
router.get("/getAllNotifications", getAllNotifications);
router.post("/saveNotification", saveNotification);
router.get("/getNotifiactionByid/:id", getNotificationsByVendorId);
router.delete("/deleteNotificationclient/:id", deleteAllNotificationClient);
router.delete("/deleteNotificationadmin", deleteAllNotificationAdmin);
router.delete("/deleteNotification/:id", deleteNotification);

module.exports = router;
