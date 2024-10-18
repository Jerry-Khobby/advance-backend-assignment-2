const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session"); // Correct package
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const setupSwagger = require("./docs/swagger");
const route = require("./routes/routes");
const fs = require("fs");
const path = require("path");
const https = require("https");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Add { extended: true }

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

//Mongodb connection
const URI = process.env.MONGO_URI;

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true }); // Add connection options for MongoDB
const database = mongoose.connection;

database.on("error", (error) => {
  console.log("MongoDb connection error: ", error);
});
database.once("open", () => {
  console.log("Connected to Mongodb Successfully");
});

const port_number = process.env.PORT || 5000;

const SSL_SECRET_KEY = process.env.SSL_SECRET_KEY;
const SSL_SECRET_CERT = process.env.SSL_SECRET_CERT_KEY;
// create an ssl server
const sslServer = https.createServer(
  {
    key: SSL_SECRET_KEY,
    cert: SSL_SECRET_CERT,
  },
  app
);
sslServer.listen(port_number, () =>
  console.log(`Secure server running on port ${port_number}`)
);
