const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

function initPassport(passport) {
    passport.use(
        new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let existingUser = await User.findOne({ email: profile.emails[0].value });
                if (existingUser) return done(null, existingUser);

                const newUser = await User.create({
                    fullname: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.emails[0].value.split("@")[0],
                    password: "", // vì login Google
                    verified: true,
                    provider: "google",
                    googleId: profile.id
                });
                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        })
    );
}
module.exports = initPassport;
