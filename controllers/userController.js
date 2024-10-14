const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();

secret = process.env.JWT_SECRET;
exports.register = async (req, res) => {
  const { name, role, email, password } = req.body;
  if (!password || !name | !role || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and contain at least one letter, one digit, and one special character",
    });
  }
  const validRoles = ["Admin", "Guest", "User"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      error: "Invalid role. Role must be one of: Admin, Guest, User.",
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 15);
    const newUser = new User({
      name: name,
      password: hashedPassword,
      email: email,
      role: role,
    });
    await newUser.save();
    // Generate a JWT
    const token = jwt.sign({ id: newUser._id }, secret, { expiresIn: "1h" });
    res.status(200).json({ message: "Signup successful", token: token });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!password || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and contain at least one letter, one digit, and one special character",
    });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const passwordmatch = await bcrypt.compare(password, user.password);
    if (!passwordmatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // asssigned the token
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successfully", token: token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//req.user = user; // Attach the user object to request
//req.userId = decoded.id;

exports.assign_roles = async (req, res) => {
  try {
    const { id, role } = req.body;
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied: Admins Only" });
    }
    const validRoles = ["Guest", "User", "Admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    // check if the user being updated is not the same Admin(avoid self-role changes)
    if (req.userId === targetUser.id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }
    // assign the new role
    targetUser.role = role;
    await targetUser.save();
    res.status(200).json({
      message: `Role updated successfully to ${role} for the user ${targetUser.name}`,
    });
  } catch (error) {
    console.error("Error assigning role:", error);
    res.status(500).json({ error: "An error occurred while assigning role" });
  }
};



exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json({
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while retrieving users",
    });
  }
};



exports.updateUser=async(req,res)=>{
  
}