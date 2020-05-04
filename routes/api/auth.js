const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const config = require("config");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

// @route GET api/auth
// @desc Get user info 
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    //   Query user from the db using current user id(check middleware/auth), excluding the user password
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (error) {
    res.json({ msg: error.msg });
  }
});

// @route POST api/auth
// @desc Login user and get auth token
// @access Public
router.post(
  "/",
  [
    // checks if email is valid
    check("email", "Please enter valid email").isEmail(),
    // checks if password is min 5 characters
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    // Finds the validation errors in request body and wraps them in an object
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
      }

      //   assign the user payload for the token, identified by the user id
      const payload = {
        user: {
          id: user.id,
        },
      };

      //   Sign the user token  using payload and secret id
      // Send the token to client/user
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
        console.error(error.msg);
        return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
