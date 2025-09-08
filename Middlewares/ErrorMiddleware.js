
const {HTTP_ERROR} = require("../constants")

const errorHandler = (err,req,res,next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    switch (statusCode) {
        case HTTP_ERROR.BadRequest:
            res.json({
                title: "BAD REQUEST",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HTTP_ERROR.Unauthorized:
            res.json({
                title: "UNAUTHORIZED",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HTTP_ERROR.PaymentRequired:
            res.json({
                title: "PAYMENT REQUIRED",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HTTP_ERROR.Forbidden:
            res.json({
                title: "FORBIDDEN",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HTTP_ERROR.NotFound:
            res.json({
                title: "NOT FOUND",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HTTP_ERROR.MethodNotAllowed:
            res.json({
                title: "METHOD NOT ALLOWED",
                message: err.message,
                stackTrace: err.stack
            });
            break;  
        case HTTP_ERROR.Conflict:
            res.json({
                title: "CONFLICT",
                message: err.message,
                stackTrace: err.stack
            });
            break;  
        case HTTP_ERROR.ServerError:
            res.json({
                title: "SERVER ERROR",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        default:
            console.log("No Error");
            break;
    }
    
};
module.exports = errorHandler;