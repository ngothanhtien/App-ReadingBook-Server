const express = require("express");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const confirmVerifyEmailTemplate = require("../views/confirmVerifyEmail");
const {onlyRegularChar, onlyRegularCharAndNumber, isValidEmail, isValidPassword} = require("../errors/all_errors");

const UserVerifycation = require("../models/userVerifycation");
const UserResponse_message = require("../models/userResponseMessage");

const nodemailer = require("nodemailer")
//unique String
const {v4: uuidv4} = require("uuid");
const send = require("send");
const path = require("path");

//nodemailer stuff
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
});

transporter.verify((error,success) => {
    if(error){
        console.log("Error: ",error);
    }else{
        console.log("Ready for messages");
        console.log(success)
    }
})

const RegisterUser = asyncHandler(async (req,res) => {
    const {fullname,email,username,password,confirm_password} = req.body;
    const existsEmail = await User.findOne({email});
    const existsUsername = await User.findOne({username});
    if(!fullname || !email || !username || !password || !confirm_password){
        res.status(400);
        throw new Error("Vui lòng nhập đầy đủ thông tin đăng ký!");
    }
    if(!onlyRegularChar(fullname)){
        res.status(400);
        throw new Error("Họ và tên người dùng không đúng định dạng!");
    }
    if(fullname.length > 28 || fullname.length < 5){
        if(fullname.length > 28){
            res.status(400);
            throw new Error("Tên đầy đủ quá dài! Tên đầy đủ hợp lệ từ 5 đến 28 ký tự!");
        }
        if(fullname.length < 5){
            res.status(400);
            throw new Error("Tên đầy đủ quá ngắn! Tên đầy đủ hợp lệ từ 5 đến 28 ký tự!");
        }
    }
    if(!isValidEmail(email)){
        res.status(400);
        throw new Error("Email không hợp lệ! Vui lòng nhập lại email!");
    }
    if(existsEmail){
        res.status(400);
        throw new Error("Email đã được sử dụng!");
    }
    if(existsUsername){
        res.status(400);
        throw new Error("Tên đăng nhập đã được sử dụng!");
    }
    if(username.length > 25 || username.length < 6){
        if(username.length > 25){
            res.status(400);
            throw new Error("Tên đăng nhập quá dài! Tên đăng nhập hợp lệ từ 6 đến 25 ký tự!");
        }
        if(username.length < 6){
            res.status(400);
            throw new Error("Tên đăng nhập quá ngắn! Tên đăng nhập hợp lệ từ 6 đến 25 ký tự!");
        }
    }
    if(!onlyRegularCharAndNumber(username)){
        res.status(400);
        throw new Error("Tên đăng nhập chỉ bao gồm chữ cái và số!");
    }
    if(!isValidPassword(password)){
        res.status(400);
        throw new Error("Mật khẩu không hợp lệ! Vui lòng nhập lại mật khẩu!");
    }
    if( confirm_password !== password){
        res.status(400);
        throw new Error("Mật khẩu xác nhận không trùng khớp!!");
    }
    try {
        const saltRounds = 10;
        const hash_password = await bcrypt.hash(password, saltRounds);

        const new_user = await User.create({
            fullname,
            email,
            username,
            password: hash_password
        });

        if (new_user) {
            sendVerificationEmail(new_user, res);
            return; // tránh gửi response 2 lần
        } else {
            res.status(400).json({
                message: "Đăng ký người dùng không thành công! Lỗi không xác định.",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "FAILED",
            message: "Lỗi khi đăng ký người dùng!",
        });
    }
});

// hàm gửi email xác thực khi đăng ký thành công
const sendVerificationEmail = ({_id,email},res) => {
    const CurrentUrl = process.env.LOCALHOST;
    const uniqueString = uuidv4() + _id;
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Xác thực email của bạn - ReadingCorner",
        html: confirmVerifyEmailTemplate(email, _id, uniqueString, CurrentUrl)
    
    }
    const saltRounds = 10;
    bcrypt.hash(uniqueString,saltRounds)
    .then((hashedUniqueString) => {
       // set value for userVerifycation
       const newUserVerification = new UserVerifycation({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
        });
        newUserVerification
        .save()
        .then(() => {
            transporter.sendMail(mailOptions).then(() => {
                res.status(200).json({
                    status: "PENDING",
                    message: "Vui lòng kiểm tra email để xác thực tài khoản của bạn!",
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    status: "FAILED",
                    message: "Lỗi khi gửi email xác thực!"
                });
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                status: "FAILED",
                message: "Lỗi khi lưu bản ghi xác thực người dùng!"
            });
       })
    })
    .catch(() => {
        res.status(500).json({
            status: "FAILED",
            message: "Lỗi khi băm chuỗi duy nhất xác thực!"
        });
    })
}

// xử lý khách hàng xác thực email
const handlerVerifyEmail = asyncHandler(async (req, res) => {
    let { userId, uniqueString } = req.params;
    UserVerifycation
        .find({ userId })
        .then((result) => {
            if (result.length > 0) {
                // user verification record exists
                const { expiresAt } = result[0];
                const hashedUniqueString = result[0].uniqueString;

                if (expiresAt < Date.now()) {
                    // verification link has expired
                    UserVerifycation.deleteOne({ userId })
                        .then(() => {
                            let message = "Liên kết xác thực đã hết hạn. Vui lòng đăng ký lại.";
                            res.redirect(`/api/users/verified?error=${message}`);
                        })
                        .catch((error) => {
                            console.log(error);
                            let message = "Lỗi khi xóa bản ghi xác thực người dùng";
                            res.redirect(`/api/users/verified?error=${message}`);
                        });
                } else {
                    // valid record exists - compare unique strings
                    bcrypt.compare(uniqueString, hashedUniqueString)
                        .then((compareResult) => {
                            if (compareResult) {
                                // unique string match
                                User.updateOne(
                                    { _id: userId },
                                    { verified: true } // sửa từ 'true' thành true
                                ).then(() => {
                                    UserVerifycation.deleteOne({ userId })
                                        .then(() => {
                                            // Redirect to verified page instead of calling function
                                            res.redirect('http://localhost:5000/verified');
                                        }).catch((error) => {
                                            console.log(error);
                                            let message = "Lỗi khi xóa bản ghi xác thực người dùng";
                                            res.redirect(`/api/users/verified?error=${message}`);
                                        })
                                }).catch((error) => {
                                    console.log(error);
                                    let message = "Lỗi khi cập nhật trạng thái xác thực người dùng";
                                    res.redirect(`/api/users/verified?error=${message}`);
                                })
                            } else {
                                // unique string don't match
                                let message = "Liên kết xác thực không hợp lệ. Vui lòng đăng ký lại.";
                                res.redirect(`/api/users/verified?error=${message}`);
                            }
                        }).catch((error) => {
                            console.log(error);
                            let message = "Lỗi khi so sánh chuỗi duy nhất xác thực";
                            res.redirect(`/api/users/verified?error=${message}`);
                        })
                }
            } else {
                // user verification record doesn't exist
                let message = "Bản ghi xác thực người dùng không tồn tại hoặc đã bị xóa. Vui lòng đăng ký lại.";
                res.redirect(`/api/users/verified?error=${message}`);
            }
        }).catch((error) => {
            console.log(error);
            let message = "Lỗi khi tìm kiếm bản ghi xác thực người dùng";
            res.redirect(`/api/users/verified?error=${message}`);
        })
});

const verifiedPage = asyncHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'verified.html'));
    console.log("__dirname in controller:", __dirname);
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // 1. Kiểm tra input
    if (!username || !password) {
        res.status(400);
        throw new Error("Vui lòng nhập đầy đủ thông tin đăng nhập!");
    }

    // 2. Tìm người dùng theo username
    const user = await User.findOne({ username });

    if (!user) {
        res.status(401);
        throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác!");
    }

    // 3. Kiểm tra trạng thái tài khoản
    if (user.status === false) {
        res.status(403); // 403: Forbidden
        throw new Error("Tài khoản đã bị khóa! Vui lòng liên hệ với quản trị viên.");
    }

    if (user.verified === false) {
        res.status(403); // 403: Forbidden
        throw new Error("Tài khoản chưa được xác thực! Vui lòng kiểm tra email của bạn.");
    }

    // 4. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401);
        throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác!");
    }

    // 5. Tạo token
    const accessToken = jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1day' }
    );

    // 6. Trả về response
    if(!accessToken) {
        res.status(500);
        throw new Error("Lỗi khi tạo token truy cập!");
    }else{
        res.status(200).json({
        message: "Đăng nhập thành công!",
        accessToken,
        user: {
            _id: user.id,
            fullname: user.fullname,
            email: user.email,
            username: user.username,
        }
    });
    } 
});

const CurrentUser = asyncHandler(async (req,res) => {
    const getCurrentUser = await User.findById(req.user.id);
    res.status(200).json(getCurrentUser);
})

const changeStatusUser = asyncHandler ( async(req,res) => {
    const {email,status} = req.body;
    const user_with_email = await User.findOne({email});
    if(!user_with_email){
        res.status(404);
        throw new Error("Email không tồn tại!");
    }
    user_with_email.status = status;
    await user_with_email.save();

    res.status(200).json({
        message: "Cập nhật trạng thái người dùng thành công!",
        updatedUser: {
        email: user_with_email.email,
        status: user_with_email.status,
        }
    });
});

const getUserById = asyncHandler(async (req,res) => {
    const user_with_id = await User.findById(req.params.id).select("-password -__v");
    if(user_with_id){
        res.status(200).json({
            user_infor: user_with_id
        })
    }else {
        res.status(404);
        throw new Error("Không tìm thấy người dùng với ID này!");
    }
})

const deleteUser = asyncHandler(async (req,res) => {
    const user_with_id = await User.findByIdAndDelete(req.params.id)
    res.status(200).json({
            status: "Thành Công",
            message: "Xóa người dùng thành công!",
    })
})

const getUser = asyncHandler( async (req,res) => {
    const count_user = await User.countDocuments();
    const getAll_user = await User.find();
    res.status(200).json({
        count_user: count_user,
        users: getAll_user
    });
})

const getRecordsNotVerification = asyncHandler(async (req,res) => {
    const records = await UserVerifycation.find();
    const count_record = await UserVerifycation.countDocuments();
    res.status(201).json({
        count_record: count_record,
        records: records
    });
});

const getRecordsNotVerificationById = asyncHandler(async (req,res) => {
    const record = await UserVerifycation.findById(req.params.id);
    const user = await User.findById(record.userId).select("-password -__v");

    if(record){
        res.status(200).json({
            record: {
                recordId: record._id,
                user: user
            },    
        });
    }else {
        res.status(404);
        throw new Error("Không tìm thấy bản ghi xác thực người dùng với ID này!");
    }
});

const changeInformationUser = asyncHandler(async (req,res) => {
    const {fullname,username,oldPassword,newPassword,confirmNewPassword} = req.body;
    if (!req.body || !req.user.email) {
        res.status(400);
        throw new Error("Dữ liệu yêu cầu không hợp lệ!");
    }
    const user_current = await User.findOne({email: req.user.email});
    if(user_current.verified === false || user_current.status === false){
        res.status(400);
        throw new Error("Tài khoản này hiện tại không thể thay đổi thông tin!");
    }
    if(!user_current){
        res.status(404);
        throw new Error("Không tìm thấy người dùng với email này!");
    }
    if(fullname !== undefined){
        if(!onlyRegularChar(fullname)){
            res.status(400);
            throw new Error("Họ và tên không đúng định dạng!");
        }
        if (fullname.length < 5 || fullname.length > 28) {
            res.status(400);
            throw new Error("Tên đầy đủ hợp lệ từ 5 đến 28 ký tự!");
        }
        user_current.fullname = fullname;
    }
    if(username !== undefined){
        if(!onlyRegularCharAndNumber(username)){
            res.status(400);
            throw new Error("Tên đăng nhập chỉ bao gồm chữ và số và không có khoảng trắng!");
        }
        if (username !== user_current.username) {
            const existsUsername = await User.findOne({ username });
            if (existsUsername) {
                res.status(400);
                throw new Error("Tên đăng nhập đã được sử dụng!");
            }
        }
        if (username.length < 6 || username.length > 25) {
            res.status(400);
            throw new Error("Tên đăng nhập hợp lệ từ 6 đến 25 ký tự!");
        }
        user_current.username = username;
    }
    if(oldPassword !== undefined || newPassword !== undefined || confirmNewPassword !== undefined){
        if(!await bcrypt.compare(oldPassword,user_current.password)){
            res.status(400);
            throw new Error("Mật khẩu cũ không trùng khớp!");
        }
        if(!isValidPassword(newPassword)){
            res.status(400);
            throw new Error("Mật khẩu mới không đúng định dạng. Vui lòng nhập lại!");
        }
        if(newPassword === oldPassword){
            res.status(400);
            throw new Error("Mật khẩu mới không được trùng với mât khẩu cũ!");
        }
        if(newPassword !== confirmNewPassword){
            res.status(400);
            throw new Error("Mật khẩu xác nhận không trùng khớp. Vui lòng nhập lại!");
        }
        const newpassword_hash = await bcrypt.hash(newPassword,10);
        user_current.password =  newpassword_hash;
    }
    const updatedUser = await user_current.save();
    
    res.status(200).json({
        status: "Thành công",
        message: "Cập nhật thông tin tài khoản thành công",
        user_now: {
            user_id: updatedUser.id,
            fullname: updatedUser.fullname,
            username: updatedUser.username,
            email: updatedUser.email
        }
    })
})

const responseMessageUser = asyncHandler( async (req,res) =>{
    const { fullname, email, title_message, content_message } = req.body;
      // 1. Kiểm tra dữ liệu đầu vào
    if (!fullname || !email || !title_message || !content_message) {
        res.status(400);
        throw new Error("Vui lòng nhập đầy đủ thông tin!");
    }
    const findEmail = await UserResponse_message.findOne({email});
    if (findEmail) {
        res.status(400);
        throw new Error("Email này đã được sử dụng để gửi tin nhắn rồi!");
    }
    const newResponseMessage = await UserResponse_message.create({
        fullname,
        email,
        title_message,
        content_message,
    });
    if(newResponseMessage){
        return res.status(201).json({
            status: "Thành công",
            message: "Gửi tin nhắn thành công!. Chúng tôi sẽ gửi phản hồi sớm nhất tới Email của bạn!"
        });
    } else {
        res.status(500);
        throw new Error("Có lỗi xảy ra khi gửi tin nhắn!");
    }
})

module.exports = {getUser,RegisterUser,CurrentUser,loginUser,getUserById,handlerVerifyEmail,verifiedPage,deleteUser,getRecordsNotVerification,getRecordsNotVerificationById,changeInformationUser,responseMessageUser,changeStatusUser}