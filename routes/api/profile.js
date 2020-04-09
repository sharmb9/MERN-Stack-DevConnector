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
    if (errors) {
      return res.status(500).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      instagram,
      facebook,
      linkedin,
      twitter,
    } = req.body;

    //   Build profile object
    const profileFields = {};
    //   from the payload
    profileFields.user = req.user.id;
    if (company) {
      profileFields.company = company;
    }
    if (website) {
      profileFields.website = website;
    }
    if (location) {
      profileFields.location = location;
    }
    if (status) {
      profileFields.status = status;
    }
    if (bio) {
      profileFields.bio = bio;
    }
    if (githubusername) {
      profileFields.githubusername = githubusername;
    }
    if (status) {
      profileFields.status = status;
    }
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //   Build social object
    profileFields.social = {};
    if (youtube) {
      profileFields.social.youtube = youtube;
    }
    if (facebook) {
      profileFields.social.facebook = facebook;
    }
    if (instagram) {
      profileFields.social.instagram = instagram;
    }
    if (twitter) {
      profileFields.social.twitter = twitter;
    }

    try {
      let profile = Profile.findOne({ user: req.user.id });
      if (profile) {
        // Find and update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json({profile});
      }
    //   If no profile in db, create one
    profile = new Profile({profileFields});
    await profile.save();
    return res.json(profile);


    } catch (error) {
        console.log(error.msg);
        res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
