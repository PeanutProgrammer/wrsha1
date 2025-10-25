const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");

// const session = require('express-session');
const cors = require("cors");
// const crypto = require("crypto");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your React app
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ✅ Listen for client connections
io.on("connection", (socket) => {
  console.log("🟢 A client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

app.set("io", io);




//global middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));
app.use(cors()); // allow http requests from localhost

// const secret = crypto.randomBytes(16).toString('hex');

// app.use(session({
//     secret: secret,
//     resave: false,
//     saveUninitialized: false
// }))


// require modules

const user = require("./routes/User");
const auth = require("./routes/Auth");
const officer = require("./routes/Officer");
const officerLog = require("./routes/OfficerLog");
const department = require("./routes/Department");
const nco = require("./routes/NCO");
const ncoLog = require("./routes/NCOLog");
const soldier = require("./routes/Soldier");
const soldierLog = require("./routes/SoldierLog");
const civillian = require("./routes/Civillian");
const civillianLog = require("./routes/CivillianLog");
const expert = require("./routes/Expert");



// const busses = require("./routes/Busses");
// const appointments = require("./routes/Appointments");
// const destinations = require("./routes/Destinations");
// const requests = require("./routes/Requests");



// API routes (endpoints)

app.use("/user",user);
app.use("/auth", auth);
app.use("/officer",officer);
app.use("/officerLog",officerLog);
app.use("/department",department);
app.use("/ncoLog",ncoLog);
app.use("/NCO",nco);
app.use("/soldier",soldier);
app.use("/soldierLog",soldierLog);
app.use("/civillian",civillian);
app.use("/civillianLog",civillianLog);
app.use("/expert",expert);


// app.use("/busses", busses);
// app.use("/appointments", appointments);
// app.use("/destinations", destinations);
// app.use("/requests", requests);

const PORT = 4001;

server.listen(PORT, "localhost", () => {
    console.log(`Server is running on port ${PORT}`);
})

module.exports = app;

