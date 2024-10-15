const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");

// setup rate limiter :maximum of 5 request per minute

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
    //Generate a one-time password (OTP)
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

exports.getProfile = async (req, res) => {
  try {
    // Assuming `req.user` contains the authenticated user details from JWT
    const userId = req.user._id;

    // Find the user by ID and exclude the password field
    const user = await User.findById(userId, "-password");

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Return the authenticated user's profile
    res.status(200).json({
      message: "User profile retrieved successfully",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while retrieving user profile",
    });
  }
};

exports.updateMe = async (req, res) => {
  // Email regex pattern for basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password regex: Minimum 8 characters, mix of alphabet and symbols (no spaces)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*[\W_]).{8,}$/;

  // Allowed roles
  const allowedRoles = ["Admin", "Guest", "User"];
  try {
    const { email, role, password, name } = req.body;
    const userId = req.userId; // From verifyToken middleware

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate email format if email is provided
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate role if provided
    if (role && !allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({ error: `Role must be one of ${allowedRoles.join(", ")}` });
    }

    // Validate password if provided
    if (password && !passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and contain a mix of letters and symbols",
      });
    }

    // Update the user data
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // Hash the password before saving if it is provided
    if (password) {
      const salt = await bcrypt.genSalt(10); // Generate a salt
      user.password = await bcrypt.hash(password, salt); // Hash the password with the salt
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      message: "User profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.delUser = async (req, res) => {
  // Check if the user is an admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  // Extract user ID from the request parameters
  const userId = req.params.id;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "Not Found: User does not exist" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Return success message
    return res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Inside your controller file
exports.publicdata = async (req, res) => {
  try {
    // Retrieve all users from the database, excluding the password field
    const users = await User.find({}, "-password"); // Exclude password field

    // Return the public data with a 200 status code
    res.status(200).json({
      message: "Public user data retrieved successfully",
      users: users,
    });
  } catch (error) {
    console.error("Error retrieving public data:", error);
    res.status(500).json({
      error: "An error occurred while retrieving public data",
    });
  }
};
