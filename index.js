const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session"); // Correct package
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const { swaggerUi, swaggerDocs } = require("./docs/swagger");
const route = require("./routes/routes");

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
// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// the routings
app.use(route);

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
app.listen(port_number, () => {
  console.log(`The server is listening successfully on ${port_number}`);
});
