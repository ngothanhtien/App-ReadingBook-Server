const HTTP_ERROR = {
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    EntityTooLarge: 413,
    URITooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ServerError: 500
};
module.exports = { HTTP_ERROR };
