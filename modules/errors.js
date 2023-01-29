const ReqError = require("./ReqError");


module.exports.noData = new ReqError(3, 'no data', 202)
module.exports.unknownRequest = new ReqError(2, 'this request does not exist', 404)

// notExist 300
module.exports.notExistError = new ReqError(300, 'object not exist error (general)', 400)
module.exports.notExistIdError = new ReqError(301, 'object not exist error (object with current id not exist)', 400)

// Validation 400
module.exports.validationError = new ReqError(400, 'validation error (general)', 400)
module.exports.validationIdError = new ReqError(401, 'validation error (invalid id)', 400)
module.exports.validationSymbolsError = new ReqError(402, 'validation error (invalid symbols)', 400)
module.exports.validationPhoneError = new ReqError(403, 'validation error (invalid phone format)', 400)
module.exports.validationPasswordError = new ReqError(404, 'validation error (invalid password format)', 400)

// Option 500
module.exports.optionError = new ReqError(500, 'invalid option (general)', 400)
module.exports.optionMethodError = new ReqError(501, 'invalid option (invalid method id)', 400)
module.exports.optionSpecializationError = new ReqError(501, 'invalid option (invalid specialization id)', 400)

// Materials 1000
module.exports.materialsNoReader = new ReqError(1101, 'current user is not a reader of this material', 400)

// Reactions 1100
module.exports.reactionsAlreadyExist = new ReqError(1201, 'current user reaction is already exist', 400)
module.exports.reactionsNotExist = new ReqError(1202, 'current user reaction is not exist', 400)