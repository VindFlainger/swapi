const {validationResult} = require("express-validator");
const ReqError = require("./ReqError");

module.exports.validationHandler = (req, res, next) => {
    const errors = validationResult(req)
    const customError = errors.array().find(error => error.msg instanceof ReqError)?.msg
    if (!errors.isEmpty()) {
        if (customError) return next(customError)
        return next(new ReqError(1, errors.array({onlyFirstError: true}), 400))
    }
    next()
}
