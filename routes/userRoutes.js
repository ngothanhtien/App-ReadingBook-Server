const express = require("express");
const {getUser,
    RegisterUser,
    CurrentUser,
    loginUser,
    getUserById,
    handlerVerifyEmail,
    verifiedPage,
    deleteUser,
    getRecordsNotVerification,
    getRecordsNotVerificationById,
    changeInformationUser,
    responseMessageUser,
    changeStatusUser
    } = require("../controllers/userController");

const validateToken = require("../Middlewares/validateTokenHandler");

const userRoute = express.Router();

// Route tĩnh trước
userRoute.get("/", getUser);
userRoute.get("/current", validateToken, CurrentUser);
userRoute.get("/verified", verifiedPage);
userRoute.get("/verify/:userId/:uniqueString", handlerVerifyEmail);
userRoute.get("/records-verifycation", getRecordsNotVerification);
userRoute.get("/records-verifycation/:id", getRecordsNotVerificationById);
userRoute.put("/change-information",validateToken, changeInformationUser);
userRoute.post("/register", RegisterUser);
userRoute.post("/login", loginUser);
userRoute.post("/send-response-message",responseMessageUser)
userRoute.put("/update-status",changeStatusUser)

// Route động cuối cùng
userRoute.route("/:id").get(getUserById).delete(deleteUser);

module.exports = userRoute;
