const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth")
const Profile = require("../../models/Profile");
const User = require("../../models/User");


// @route GET api/profile/me
// @desc TEST Get current user's profile
// @access Private
router.get ("/me", auth, async (req,res)=>{
    try {
        // Queries Profile db using user id, and populated name and avatar fields from User(user) model
         const profile = await Profile.findById({user:user.id}).populate("user",["name","avatar"]);

         if(!profile){
             res.status(400).json({msg:"User not found"});
         }
         res.send(profile);
    } catch (error) {
        console.log(error.msg);
        res.status(500).send("Server Error");
    }
});

module.exports=router