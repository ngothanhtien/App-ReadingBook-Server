const mongoose = require("mongoose");

const UserResponseSchema = mongoose.Schema({
    fullname:{
        type: String,
        required: [true,"Please fill your fullname!"]
    },
    email:{
        type: String,
        required: [true,"Please fill your email!"]
    },
    title_message:{
        type: String,
        required: [true,"Please fill your title!"]
    },
    content_message:{
        type: String,
        required: [true,"Please fill your content!"]
    },    
},{
    timestamps: true
});
const UserResponse_message = mongoose.model("UserResponseMessage",UserResponseSchema);

module.exports =  UserResponse_message;