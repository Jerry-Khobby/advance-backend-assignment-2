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
 *     summary: User Login
 *     description: Authenticates a user using their email and password, returning an OTP sent to their email for further verification. The user must go to the verify route to verify the OTP within 5 minutes to complete the login process.
 *     tags: [User]
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
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password associated with the user account.
 *                 example: P@ssword123
 *     responses:
 *       200:
 *         description: OTP sent to the user's email for verification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent to your email. Please verify it within 5 minutes to complete the login process."
 *       400:
 *         description: Bad request - one or more fields are missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "All fields are required"
 *       401:
 *         description: Unauthorized - invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /auth/verifyOtp:
 *   post:
 *     summary: Verify OTP
 *     description: Verifies the OTP sent to the user's email during login. The user must have received an OTP after a successful login and must verify it within 5 minutes to complete the login process.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's email for verification.
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verification successful, returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request - invalid or expired OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired OTP"
 *       404:
 *         description: Not found - user does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "OTP verification failed"
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
 *     summary: Retrieve the authenticated user's profile
 *     description: Fetch the profile of the currently authenticated user. The JWT token is required in the authorization header.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User profile retrieved successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607c191e810c19729de860ea"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     role:
 *                       type: string
 *                       example: "User"
 *       401:
 *         description: Unauthorized - No token or invalid token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "unauthorized: No token provided"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update the authenticated user's profile
 *     description: Allows the currently authenticated user to update their profile. Requires a JWT token in the authorization header.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []  # JWT authentication required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the user
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 description: The updated email of the user
 *                 example: janedoe@example.com
 *               password:
 *                 type: string
 *                 description: The updated password of the user
 *                 example: NewP@ssw0rd!
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully.
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607c191e810c19729de860ea"
 *                     name:
 *                       type: string
 *                       example: "Jane Doe"
 *                     email:
 *                       type: string
 *                       example: "janedoe@example.com"
 *       400:
 *         description: Bad request - invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input
 *       401:
 *         description: Unauthorized - No token or invalid token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized: No token provided."  # Updated example with quotes
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
 * /user/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by ID. Only admins are allowed to perform this action.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to be deleted.
 *         schema:
 *           type: string
 *           example: 607c191e810c19729de860ea
 *     responses:
 *       204:
 *         description: User deleted successfully.
 *       403:
 *         description: Forbidden - Only admins can delete users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden: Admins only"
 *       404:
 *         description: Not Found - User does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not Found: User does not exist"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */

/**
 * @swagger
 * /public-data:
 *   get:
 *     summary: Retrieve public data
 *     description: This endpoint provides access to data that can be viewed by any user, regardless of authentication status. It can be used to fetch information that is generally available to the public, such as promotional data or general announcements.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully retrieved public data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Public data retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       title:
 *                         type: string
 *                         example: "Welcome to Our Service"
 *                       description:
 *                         type: string
 *                         example: "This is a promotional announcement available to all users."
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-14T12:34:56Z"
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
 * tags:
 *   name: GitHub OAuth
 *   description: GitHub authentication operations
 */

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Initiate GitHub login
 *     description: Redirects the user to GitHub for authentication. This endpoint requires the user to grant permission to access their GitHub account.
 *     tags: [GitHub OAuth]
 *     responses:
 *       302:
 *         description: Redirects to GitHub for authentication.
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
 * /auth/github/callback:
 *   get:
 *     summary: GitHub callback
 *     description: Handles the callback from GitHub after authentication. It exchanges the authorization code for an access token and retrieves user information.
 *     tags: [GitHub OAuth]
 *     responses:
 *       200:
 *         description: Successfully authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123456"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     avatar_url:
 *                       type: string
 *                       example: "https://avatars.githubusercontent.com/u/123456?v=4"
 *                 token:
 *                   type: string
 *                   description: JWT token for the authenticated user.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request - failed to authenticate with GitHub.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to authenticate with GitHub"
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
 * /auth/github/success:
 *   get:
 *     summary: GitHub authentication success page
 *     description: Displays a success message after successful GitHub authentication.
 *     tags: [GitHub OAuth]
 *     responses:
 *       200:
 *         description: Displays a success message.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<h1>Authentication successful!</h1>"
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
 * /auth/github/error:
 *   get:
 *     summary: GitHub authentication error page
 *     description: Displays an error message if GitHub authentication fails.
 *     tags: [GitHub OAuth]
 *     responses:
 *       200:
 *         description: Displays an error message.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<h1>Authentication failed!</h1>"
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
 * /auth/github/signout:
 *   get:
 *     summary: Sign out from GitHub
 *     description: Logs the user out of their GitHub account and clears the session.
 *     tags: [GitHub OAuth]
 *     responses:
 *       200:
 *         description: Successfully signed out.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully signed out"
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

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/jwt-verify");
const rateLimit = require("express-rate-limit");
const githubAuthController = require("../controllers/github-auth");
const passport = require("passport");

// Set up rate limiter: maximum of 5 requests per minute
const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many login attempts from this IP, please try again later.",
  },
});

router.post("/auth/register", userController.register);
router.post("/auth/login", loginRateLimiter, userController.login);
router.post("/auth/login/verifyOtp", userController.verifyOTP);
router.post("/auth/assign-role", verifyToken, userController.assign_roles);
router.get("/profile", verifyToken, userController.getProfile);
router.put("/profile", verifyToken, userController.updateMe);
router.delete("/user/:id", verifyToken, userController.delUser);
router.get("/public-data", verifyToken, userController.publicdata);

// Route to initiate GitHub login
router.get("/auth/github",passport.authenticate("github", { scope: ["user:email"] }));

// Route for GitHub callback
router.get("/auth/github/callback", githubAuthController.githubCallback);

// Route for success page
router.get("/auth/github/success", githubAuthController.githubSuccess);

// Route for error page
router.get("/auth/github/error", githubAuthController.githubError);

// Route for signout
router.get("/auth/github/signout", githubAuthController.githubSignOut);
module.exports = router;
