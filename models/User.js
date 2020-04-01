const mongoose=require("mongoose");

// User Scheme:  An object of objects to define the user schema
const UserSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const User = mongoose.model("users", UserSchema);

module.exports = User;