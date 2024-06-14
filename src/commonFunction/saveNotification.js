const Notification = require("../model/notifications.model");

const saveNotification = async(data) => {
try{
    const info = {
        vendorId: data.vendorId,
        notificationType: data.notificationType,
        message: data.message,
        click: data.click
    }
    const notification = await Notification.create(info);
    await notification.save();
}catch(e){
    console.error("Error saving notification:", err);
  
}
}

module.exports = saveNotification;
