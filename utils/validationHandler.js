const {validationResult} = require("express-validator");
const ReqError = require("./ReqError");

module.exports.validationHandler = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const customError = errors.array().find(error => error.msg instanceof ReqError)
        if (customError) {
            return next(new ReqError(
                customError.msg.code,
                `${customError.msg.message} ${customError.param ? "| param: " + customError.param : ""}`,
                customError.msg.status
            ))
        }
        return next(new ReqError(1, errors.array({onlyFirstError: true}), 400))
    }
    next()
}
