const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username:{
        type:String,
        required: false
    },
    password:{
        type: String,
        required: false
    },
    status: {
        type: Boolean,
        default: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    provider: {
        type: String, // google, local
        default: "local"
    },
    googleId: {
        type: String
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("User", userSchema);
