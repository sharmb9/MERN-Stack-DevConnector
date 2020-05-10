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

// @route GET api/posts
// @desc Get all posts
// @access private
router.get("/", auth, async (req,res) => {
  try {
    // Finds all the posts and sorts by date(most recent first)
    const posts = await Post.find().sort({date:-1});
    res.json(posts);
  } catch (error) {
      res.status(500).json("Server error, check logs");
      console.log(error.message);
  }
});

// @route GET api/posts/:id
// @desc Get posts by id
// @access private
router.get("/:id", auth, async (req,res) => {
  try {
    // Finds all the posts and sorts by date(most recent first)
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json("Post not found")
    }
    res.json(post);
  } catch (error) {
      if(error.kind=='ObjectId'){
        return res.status(404).json("Post not found")
      }
      res.status(500).json("Server error, check logs");
      console.log(error.message);
  }
});

// @route Delete api/posts/
// @desc Delete a post
// @access private
router.delete("/:id", auth, async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json("Post not found")
    }
    // Check if the post if by the auth user
    if(post.user.toString() != req.user.id){
      return res.status(401).json({msg:"User not authorised"});
    }
    await post.remove();
    res.json({msg:"Post removed"})
  } catch (error) {
    if(error.kind=='ObjectId'){
      return res.status(404).json("Post not found")
    }
    res.status(500).json("Server error, check logs");
    console.log(error.message);
  }
})


module.exports = router;
