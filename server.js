const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const DbConnecttion = require("./config/dbConnection");
const errorHandler = require('./Middlewares/ErrorMiddleware');
const userRoutes = require('./routes/userRoutes');
const userPasswordResetRoutes = require('./routes/userPasswordResetRoutes');
const session = require('express-session');
const passport = require('passport');
const initPassport = require('./config/passport');
const authRouter = require('./routes/authRouter');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.URL_CLIENT,
  credentials: true
}));

app.use(passport.initialize());
initPassport(passport);

app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use("/api/users",userRoutes);
app.use("/api/reset-password",userPasswordResetRoutes);

DbConnecttion();
app.get('/verified', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'verified.html'));
});

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})
app.use(errorHandler);


