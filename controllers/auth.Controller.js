const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const googleCallback = (req, res) => {
  try {
    const user = req.user; // đã có từ passport
    const accessToken = jwt.sign(
            {
              id: user._id,
              username: user.username,
              email: user.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1day' }
    );
    // Redirect về frontend + kèm token
    res.redirect(`${process.env.URL_CLIENT}/auth/success?token=${accessToken}`);
  } catch (err) {
    res.redirect(`${process.env.URL_CLIENT}/login`);
  }
};
module.exports = googleCallback;
