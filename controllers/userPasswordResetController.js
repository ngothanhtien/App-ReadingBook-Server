const express = require("express");
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const nodemailer = require("nodemailer");
const {isValidEmail,isValidPassword} = require('../errors/all_errors');
require("dotenv").config();
const PasswordReset = require('../models/userPasswordResetModel');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Ready to send emails");
    }
});
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Xác thực khôi phục mật khẩu',
        html: `
            <h1>@ReadingCorner Xin Chào</h1>
            <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
            <p>Vui lòng nhập Không chia sẽ mã này cho bất kỳ ai khác!</p>
            <p>Mã này sẽ hết hạn sau 10 phút.</p>
        `
    }
    await transporter.sendMail(mailOptions);
};
const requestOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Vui lòng nhập email cần reset mật khẩu!");
    }
    if (!isValidEmail(email)) {
        res.status(400);
        throw new Error("Email không hợp lệ!");
    }
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("Email này chưa được đăng ký tài khoản!");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
    await PasswordReset.findOneAndUpdate(
        { email },
        { otp, expiresAt, verified: false },
        { upsert: true, new: true }
    );
    await sendOTPEmail(email, otp);
    res.status(200).json({
        message: "OTP đã được gửi đến email của bạn! Vui lòng kiểm tra email."
    });
});
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const record = await PasswordReset.findOne({ email });
    if (!record || record.otp !== otp || record.expiresAt < new Date()) {
        res.status(400);
        throw new Error('OTP không hợp lệ hoặc đã hết hạn.');
    }
    record.verified = true;
    await record.save();
    res.status(200).json({ message: 'OTP xác thực thành công!' });
})

const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword,confirm_newpassword } = req.body;
    const record = await PasswordReset.findOne({ email });
    if (!record || !record.verified) {
        res.status(400);
        throw new Error('OTP chưa được xác minh hoặc email sai.');
    }
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('Người dùng không tồn tại.');
    }
    if( !newPassword || !confirm_newpassword) {
        res.status(400);
        throw new Error('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu mới!');
    }
    if(isValidPassword(newPassword) === false) {
        res.status(400);
        throw new Error('Mật khẩu mới không hợp lệ! Mật khẩu phải từ 6 đến 25 ký tự, bao gồm chữ hoa, chữ thường và số.');
    }
    if (newPassword !== confirm_newpassword) {
        res.status(400);
        throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await PasswordReset.deleteOne({ email });
    res.status(200).json({
        message: "Mật khẩu đã được cập nhật thành công!"
    });
});
const getRecordResetPassword = asyncHandler(async (req, res) => {
    const record = await PasswordReset.find();
    if (!record) {
        res.status(404);
        throw new Error('Không tìm thấy bản ghi khôi phục mật khẩu cho email này.');
    }
    res.status(200).json({
        records: record
    });
});
module.exports = {getRecordResetPassword,requestOtp,verifyOTP,resetPassword};


