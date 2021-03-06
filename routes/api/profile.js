const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// @route GET api/profile/me
// @desc  Get current user's profile
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    // only populate from user document if profile exists
    res.json(profile.populate("user", ["name", "avatar"]));
  } catch (err) {
    console.error(err.message);
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
    if (!errors.isEmpty()) {
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
    if (linkedin) {
      profileFields.social.linkedin = linkedin;
    }

    try {
      // Use upser function to create or update
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error, check logs");
    }
  }
);

// @route GET api/profile
// @desc Gets all profiles
// @access Public
router.get("/", async (req, res) => {
  try {
    // Queries all the profiles in collection and populates them with name,avatar from user collection
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error, check logs");
  }
});

// @route GET api/profile/user/:user_id
// @desc Gets profile by USER ID
// @access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json("Profile not Found!");
    }
    res.json(profile);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(400).json("Profile not Found!");
    }
    console.log(error.message);
    res.status(500).json("Server error, check logs");
  }
});

// @route DELETE api/profile/
// @desc Delete profile and user
// @access Private
router.delete("/", auth, async (req, res) => {
  try {
    // Delete profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Delete user
    await User.findOneAndRemove({ _id: req.user.id });
    res.status(500).json({ msg: "User deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT api/profile/experience
// @desc Adds experience to user profile
// @access Private
router.put(
  "/experience",
  [
    auth,
    [
      check(
        ["title", "company", "location", "from", "description"],
        "Field required"
      )
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    // Creating new exprerience object
    const newExp = {
      title,
      company,
      from,
      to,
      current,
      description,
      location,
    };
    console.log(newExp);

    try {
      const profile = await Profile.findOneAndUpdate({ user: req.user.id });
      // pushes new experience at the starting of the array
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(400).send("Server error, Check logs");
    }
  }
);

// @route DELETE api/profile/experience/:exp_id
// @desc Delete experience from porfile
// @access Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const exp_ids = profile.experience.map((item) => item.id);
    const removeIndex = exp_ids.indexOf(req.param.exp_id);
    // deletes one element starting from exp_index
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).json("Server error, check logs");
  }
});

// @route PUT api/profile/education
// @desc Adds education to user profile
// @access Private
router.put(
  "/education",
  [
    auth,
    [
      check(
        ["school", "degree", "fieldofstudy", "from", "description"],
        "Please fill in all mandatory fields"
      )
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    // Creating new education object
    const educationFields = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(educationFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).json("Server error, check logs");
    }
  }
);

// @route DELETE api/profile/:edu_id
// @desc Deletes Education from user profile
// @access Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const edu_ids = profile.experience.map((item) => item.id);
    const removeIndex = edu_ids.indexOf(req.param.edu_id);
    // deletes one element starting from exp_index
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).json("Server error, check logs");
  }
});

module.exports = router;
