const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const generateToken = require("../middlewares/jwt-generate");

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
    const token = generateToken(newUser);
    res.status(200).json({ message: "Signup successful", token: token });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Temporary in-memory store for OTPs, can replace with Redis or DB for production

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and contain at least one letter, one digit, and one special character",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate OTP
    const otp = speakeasy.totp({
      secret: process.env.OTP_SECRET,
      encoding: "base32",
    });

    // Store OTP temporarily (In-memory or in database)
    req.session.otp = otp; // Use session or a temporary storage

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Your OTP for Login",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    };

    console.log(otp);

    await transporter.sendMail(mailOptions);

    // Send the response indicating the OTP was sent
    return res.status(200).json({
      message:
        "OTP sent to your email. Please verify it. Please go into the verify route and verify the OTP to ensure that you are logged in",
    });

    // If you want to redirect to OTP verification page in a frontend system, handle it on the client side.
    // Example: res.redirect("/auth/login/verifyOtp");  --> (REMOVE this if sending JSON response)
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  console.log(otp);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Verify OTP
    const isVerified = speakeasy.totp.verify({
      secret: process.env.OTP_SECRET,
      encoding: "base32",
      token: otp,
      window: 2, // Adjust the window to allow for a time drift
    });

    if (!isVerified) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // OTP is valid, generate JWT
    const token = generateToken(user);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "OTP verification failed" });
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
