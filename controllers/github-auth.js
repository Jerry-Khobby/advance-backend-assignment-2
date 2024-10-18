const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const passport = require("passport");
const GithubStrategy = require("passport-github2");
const jwtGenerate = require("../middlewares/jwt-generate");

// Github Strategy setup
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne({
          accountId: profile.id,
          provider: "github",
        });

        if (!user) {
          // Add new GitHub user
          user = new User({
            accountId: profile.id,
            name: profile.username || profile.displayName, // profile.displayName might be more appropriate
            provider: profile.provider,
          });
          await user.save();
          return cb(null, user);
        } else {
          // User already exists
          return cb(null, user);
        }
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

// Controller for GitHub callback (login)
exports.githubCallback = (req, res) => {
  passport.authenticate(
    "github",
    { failureRedirect: "/auth/github/error" },
    function (err, user) {
      if (err || !user) {
        return res.status(401).json({
          status: "fail",
          message: "GitHub authentication failed",
        });
      }

      const token = jwtGenerate(req.user);
      // Successful login
      return res.status(200).json({
        status: "success",
        message: "GitHub authentication successful",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          provider: user.provider,
        },
      });
    }
  )(req, res);
};

// Controller for success page (returns user info)
exports.githubSuccess = (req, res) => {
  if (!req.session.passport || !req.session.passport.user) {
    return res.status(401).json({
      status: "fail",
      message: "User not logged in",
    });
  }

  const userInfo = {
    id: req.session.passport.user.id,
    displayName: req.session.passport.user.username,
    provider: req.session.passport.user.provider,
  };

  return res.status(200).json({
    status: "success",
    message: "GitHub login success",
    user: userInfo,
  });
};

// Controller for error page
exports.githubError = (req, res) => {
  return res.status(400).json({
    status: "fail",
    message: "Error logging in via GitHub",
  });
};

// Controller for signing out
exports.githubSignOut = (req, res) => {
  try {
    req.session.destroy(function (err) {
      if (err) {
        return res.status(500).json({
          status: "fail",
          message: "Failed to destroy session",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Signed out successfully",
      });
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: "Failed to sign out GitHub user",
    });
  }
};
