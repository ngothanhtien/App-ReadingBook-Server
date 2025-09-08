const express = require('express');

const {getRecordResetPassword,requestOtp,verifyOTP,resetPassword} = require('../controllers/userPasswordResetController');

const router_resetpw = express.Router();
router_resetpw.post("/request-otp",requestOtp);
router_resetpw.post("/verify-otp",verifyOTP);
router_resetpw.post("/submit",resetPassword);
router_resetpw.get("/get-record-reset-password",getRecordResetPassword);

module.exports = router_resetpw;

