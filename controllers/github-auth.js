const User = require("../models/user");
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
      console.log("Received profile from GitHub:", profile);
      try {
        console.log("Checking for user with accountId:", profile.id);
        let user = await User.findOne({
          accountId: profile.id,
          provider: "github",
        });
        console.log("Found user:", user);

        if (!user) {
          // Add new GitHub user
          user = new User({
            accountId: profile.id,
            name: profile.username || profile.displayName,
            provider: profile.provider,
          });
          console.log("Creating new user:", user);
          await user.save();
          console.log("New user saved:", user);
          return cb(null, user);
        } else {
          // User already exists
          console.log("User already exists:", user);
          return cb(null, user);
        }
      } catch (error) {
        console.error("Error during GitHub authentication:", error);
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
      if (err) {
        console.error("Authentication error:", err);
        return res.status(401).json({
          status: "fail",
          message: "GitHub authentication failed",
        });
      }
      if (!user) {
        console.error("User not found after authentication");
        return res.status(401).json({
          status: "fail",
          message: "GitHub authentication failed",
        });
      }

      const token = jwtGenerate(user);
      console.log("Successful login. Generated token:", token);
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
    console.warn("User not logged in or session is invalid.");
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

  console.log("User info retrieved for success page:", userInfo);
  return res.status(200).json({
    status: "success",
    message: "GitHub login success",
    user: userInfo,
  });
};

// Controller for error page
exports.githubError = (req, res) => {
  console.error("Error logging in via GitHub.");
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
        console.error("Failed to destroy session:", err);
        return res.status(500).json({
          status: "fail",
          message: "Failed to destroy session",
        });
      }

      console.log("User signed out successfully.");
      return res.status(200).json({
        status: "success",
        message: "Signed out successfully",
      });
    });
  } catch (err) {
    console.error("Failed to sign out GitHub user:", err);
    return res.status(400).json({
      status: "fail",
      message: "Failed to sign out GitHub user",
    });
  }
};
