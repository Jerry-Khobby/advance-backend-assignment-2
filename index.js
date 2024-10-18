const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const setupSwagger = require("./docs/swagger");
const route = require("./routes/routes");
const fs = require("fs");
const path = require("path");
// const https = require("https"); // SSL server not needed for now

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  session({
    secret: "Your secret key",
    saveUninitialized: true,
    resave: false,
  })
);

app.use(cors());

// the routings
app.use(route);
// Swagger setup
setupSwagger(app);

// MongoDB connection
const URI = process.env.MONGO_URI;

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
const database = mongoose.connection;

database.on("error", (error) => {
  console.log("MongoDb connection error: ", error);
});
database.once("open", () => {
  console.log("Connected to MongoDB Successfully");
});

const port_number = process.env.PORT || 5000;

/*
// SSL Server Setup (Commented out)
const sslServer = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
  },
  app
);

sslServer.listen(port_number, () =>
  console.log(`Secure server running on port 🚀🔑 ${port_number}`)
);
*/

// Regular HTTP server
app.listen(port_number, () => {
  console.log(`Server running on port 🚀 ${port_number}`);
});
