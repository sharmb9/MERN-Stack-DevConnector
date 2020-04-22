const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/User");
// const jwtSecret = config.get("jwtSecret");

// https://express-validator.github.io/docs/
const { check, validationResult } = require("express-validator");



// @route POST api/users
// @desc Register user
// @access Public
router.post(
  "/",
  [
    // checks if name is empty or not
    check("name", "Name is require")
      .not()
      .isEmpty(),
    // checks if email is email
    check("email", "please enter a valid eamail").isEmail(),
    // checks if password is min 5 characters
    check(
      "password",
      "please enter atelast 5 characters for password"
    ).isLength({ min: 5 })
  ],
  async (req, res) => {
    // Finds the validation errors in request body and wraps them in an object
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Queries User model and matches user with email:email
      let user = await User.findOne({ email });

      // If user already exists
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // If new user, get user gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      //   If new user, create the user
      user = new User({
        name,
        email,
        avatar,
        password
      });

      //   Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // save the user
      await user.save();

      //   assign the user payload for the token, identified by the user id
      const payload = {
        user: {
          id: user.id
        }
      };

      //   Sign the user token  using payload and secret id
      // Send the token to client/user
      jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({token});
      });
    } catch (error) {
      console.error(error.msg);
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
