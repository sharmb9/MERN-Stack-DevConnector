const express = require("express");
// https://express-validator.github.io/docs/
const { check, validationResult } = require("express-validator");
const router = express.Router();

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
  (req, res) => {
    // Finds the validation errors in request body and wraps them in an object
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);
    res.send("User route");
  }
);

module.exports = router;
