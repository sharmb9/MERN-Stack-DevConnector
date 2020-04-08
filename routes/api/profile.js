const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// @route GET api/profile/me
// @desc TEST Get current user's profile
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    // Queries Profile db using user id, and populated name and avatar fields from User(user) model
    const profile = await Profile.findById({ user: user.id }).populate("user", [
      "name",
      "avatar",
    ]);

    if (!profile) {
      res.status(400).json({ msg: "User not found" });
    }
    res.send(profile);
  } catch (error) {
    console.log(error.msg);
    res.status(500).send("Server Error");
  }
});

// @route POST api/profile
// @desc Create or update user's profile
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
      const errors = validationResult(req);
      if(errors){
          return res.status(500).json({errors:errors.array()});
      }
  }
);

module.exports = router;
