const express = require("express");
const app = express();
require("dotenv").config();
const { connectDB } = require("./db/conn");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const cors = require("cors");
var path = require("path");

app.use(express.json());
app.use(cookieParser());
connectDB();

// cors middleware
app.use(cors({ origin: true, credentials: true }));

app.use(express.urlencoded({ extended: false }));

//Socket io

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
// by tehseem
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("newUser", (data) => {
    console.log(data)
  });
  socket.on("disconnect", () => {
    console.log(`someone has left ${socket.id}`);
  });
});


// io.on("connection",(socket) =>{
//   console.log(`User connected: ${socket.id}`)

//   socket.on("send_message",(data) =>{
//     console.log(data)
//   })
// })


// static routes
const publicPath = path.join(__dirname, "public/upload");
app.use(express.static(publicPath));


app.get('/', (req, res) => {
  res.json({ message: 'API is live!' });
});


app.use((req, res, next) => {
  req.io = io;
  next();
});
// user routes
const user = require("./src/routes/user.routes");
app.use("/user", user);

// vendor routes
const vendor = require("./src/routes/vender.routes");
app.use("/vendor", vendor);

//Client User
const clientUser = require("./src/routes/clientUser.routes");
app.use("/ClientUser", clientUser);

/// paymentRMB routes
const paymentRMB = require("./src/routes/paymentRMB.routes");
app.use("/paymentRMB", paymentRMB);

/// transaction routes
const transaction = require("./src/routes/transaction.routes");
app.use("/transaction", transaction);

/// payment routes
const payment = require("./src/routes/payment.routes");
app.use("/payment", payment);

///conversion routes
const conversion = require("./src/routes/conversion.routes");
app.use("/conversion", conversion);

/// purchase routes
const purchase = require("./src/routes/purchase.routes");
app.use("/purchase", purchase);

///shipment
const shipment = require("./src/routes/shipment.routes");
app.use("/shipment", shipment);

///adminShipment
const adminShipment = require("./src/routes/adminShipment.routes");
app.use("/adminShipment", adminShipment);

server.listen(port, () => {
  console.log(`server listening on ${port}`);
});
