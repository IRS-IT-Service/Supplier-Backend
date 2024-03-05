const axios = require("axios");

async function sendMessage(message) {
  let chatId = process.env.WHATSAPP_NUMBER;

  try {
    const response = await axios.post(
      process.env.WHATSAPP_URL,
      {
        chatId,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WAAPI_TOKEN}`,
        },
      }
    );
    
    return response.data
    
  } catch (err) {
    console.log(err);
  }
}

module.exports = sendMessage;
