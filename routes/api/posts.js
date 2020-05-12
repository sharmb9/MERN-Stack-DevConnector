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
      res.status(400).json({ erros: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
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
router.get("/", auth, async (req, res) => {
  try {
    // Finds all the posts and sorts by date(most recent first)
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json("Server error, check logs");
    console.log(error.message);
  }
});

// @route GET api/posts/:id
// @desc Get posts by id
// @access private
router.get("/:id", auth, async (req, res) => {
  try {
    // Finds all the posts and sorts by date(most recent first)
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }
    res.json(post);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json("Post not found");
    }
    res.status(500).json("Server error, check logs");
    console.log(error.message);
  }
});

// @route Delete api/posts/
// @desc Delete a post
// @access private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }
    // Check if the post if by the auth user
    if (post.user.toString() != req.user.id) {
      return res.status(401).json({ msg: "User not authorised" });
    }
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json("Post not found");
    }
    res.status(500).json("Server error, check logs");
    console.log(error.message);
  }
});

// @route PUT api/posts/like/:id
// @desc Like a post
// @access private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id).length >
      0
    ) {
      // console.log(like.user.toString);
      return res.status(400).json({ msg: "Post already liked!" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json("Post not found");
    }
    res.status(500).json("Server error, check logs");
    console.log(error.message);
  }
});

// @route PUT api/posts/unlike/:id
// @desc Unlike a post
// @access private
router.put("/unlike/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    // Check if the post has been liked by the user
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id)
        .length === 0
    ) {
      // console.log(like.user.toString);
      return res.status(400).json({ msg: "Post not liked yet" });
    }

    // An array of users from like array
    const users = post.likes.map((like) => like.user.toString());
    // Index of user to be removed
    const removeIndex = users.indexOf(req.user.id);

    // Remove the user from array of users (likes)
    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json("Post not found");
    }
    res.status(500).json("Server error, check logs");
    console.log(error.message);
  }
});

// @route PUT api/posts/comment/:id
// @desc Make a comment
// @access private
router.put(
  "/comment/:id",
  [
    auth,
    check("text", "Please enter the text for the comment").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ erros: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json("Post not found");
      }

      const user = await User.findById(req.user.id).select("-password");

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      console.log(newComment.user);

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (error) {
      if (error.kind == "ObjectId") {
        return res.status(404).json("Post not found");
      }
      res.status(500).json("Server error, check logs");
      console.log(error.message);
    }
  }
);

// @route Delete api/posts/comment/:id/:comment_id
// @desc Remove a comment
// @access private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    // Pull out the comment
    const comment = post.comments.find(
      (comment) => comment.id == req.params.comment_id
    );

    // Check if comment exists
    if (!comment) {
      return res.status(404).json("Comment not found");
    }

    // Make sure user is authorised to delete the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(404).json("User not authorised to delete the comment");
    }

    // Filter out comments with current comment id
    const comments = post.comments.filter(
      (comment) => comment.id.toString() != req.params.comment_id
    );

    // New comments array
    post.comments = comments;

    await comments.save();
    res.json(post.comments);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json("Post not found");
    }
    res.status(500).json("Server error, check logs");
    console.log(error.message);
  }
});

module.exports = router;
