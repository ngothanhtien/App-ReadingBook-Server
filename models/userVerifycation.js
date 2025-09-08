const mongoose = require("mongoose")

const UserVerifycationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User'
    },
    uniqueString: {
        type: String,
        required: [true, 'Unique string is required']
    },
    createdAt: {
        type: Date,
        required: [true, 'Created date is required'],
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiry date is required']
    }
})
const UserVarifycation = mongoose.model("UserVerification",UserVerifycationSchema);

module.exports = UserVarifycation;