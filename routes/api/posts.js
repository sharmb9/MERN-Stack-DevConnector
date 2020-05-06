const express = require("express");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const User = require("../../models/User");
const Post = require("../../models/Posts");

// @route POST api/posts
// @desc Create a post
// @access private
router.post(
  "/",
  [auth, check("text", "Please enter the text for the post").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({erros:errors.array()});
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(newPost);
    } catch (error) {
      console.log(error.message);
      res.status(500).json("Server error, checks logs");
    }
  }
);

module.exports = router;
