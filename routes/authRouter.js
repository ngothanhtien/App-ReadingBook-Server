const express = require('express');
const passport = require('passport');
const googleCallback  = require('../controllers/auth.Controller');

const router = express.Router();

router.get('/google', 
    passport.authenticate("google", { scope: ['profile', 'email'] })
);

// Callback từ Google
router.get(
  '/google/callback',
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

module.exports = router;