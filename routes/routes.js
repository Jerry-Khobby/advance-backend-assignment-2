/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management operations
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]  # Changed this to match the User tag
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user by email and password, and returns a JWT token if the credentials are valid.
 *     tags: [User]  # Changed this to match the User tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user.
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 description: Role of the user.
 *                 example: Admin
 *               email:
 *                 type: string
 *                 description: Email address of the user.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: Password for the user account.
 *                 example: P@ssword123
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successfully
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request, one or more fields are missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required
 *       401:
 *         description: Unauthorized, invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /auth/assign-role:
 *   post:
 *     summary: Assign a role to a user (Admin-only)
 *     description: This endpoint allows an admin to assign a role (Admin, User, Guest) to another user. Only users with the 'Admin' role can use this endpoint.
 *     tags: [User]  # Changed this to match the User tag
 *     security:
 *       - bearerAuth: []  # Use the Bearer token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to whom the role is being assigned.
 *                 example: 613b6c8b57c2a70016f8d5b4
 *               role:
 *                 type: string
 *                 description: The role to assign to the user.
 *                 enum: [Admin, User, Guest]
 *                 example: User
 *     responses:
 *       200:
 *         description: Role assigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role assigned successfully.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 613b6c8b57c2a70016f8d5b4
 *                     name:
 *                       type: string
 *                       example: Jane Doe
 *                     role:
 *                       type: string
 *                       example: User
 *       400:
 *         description: Bad request - Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid user ID or role.
 *       403:
 *         description: Forbidden - Only admin users can assign roles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: You are not authorized to assign roles.
 *       404:
 *         description: Not found - User does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users. Only accessible to authenticated users.
 *     tags: [User]  # Changed this to match the User tag
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 607c191e810c19729de860ea
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: johndoe@example.com
 *                       role:
 *                         type: string
 *                         example: User
 *       401:
 *         description: Unauthorized - No token or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "unauthorized: No token provided"  # Ensure this is properly formatted.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."  # Proper string format.
 */

const express = require("express");

const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/jwt-verify");

router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);
router.post("/auth/assign-role", verifyToken, userController.assign_roles);
router.get("/profile", verifyToken, userController.getAllUser);

module.exports = router;
