
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  vendorId: {
    type: String,
  },

  notificationType:{
    type: String,
  },
  message: {
    type: String,
  },
  click: {
    type: String,
  },
}, {
  timestamps: true,
});



module.exports = mongoose.model("Notification", notificationSchema);


