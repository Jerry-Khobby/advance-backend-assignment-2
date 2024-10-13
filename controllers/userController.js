const verifyToken = require("../middlewares/jwt-verify");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management operations
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 description: The role of the user (Admin, Guest, User)
 *                 enum: [Admin, Guest, User]
 *                 example: User
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password for the user
 *                 example: Passw0rd!
 *     responses:
 *       200:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Signup successful
 *                 token:
 *                   type: string
 *                   description: JWT token for the newly registered user
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request - invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required
 *       409:
 *         description: Conflict - user with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User with this email already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

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
    const hashedPassword = await bcrypt.hash(password, 10);
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

exports.login = (req, res) => {};
