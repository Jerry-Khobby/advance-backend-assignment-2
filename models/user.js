const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const User = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Guest", "User", "Admin"],
    required: true,
    default: "Guest",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", User);
