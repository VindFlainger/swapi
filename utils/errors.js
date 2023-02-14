const ReqError = require("./ReqError");

// TODO: DEPRECATED
module.exports.noData = new ReqError(3, 'no data', 202)

// auth 100
module.exports.authTokenNotAllowed = new ReqError(104, 'received token is not allowed', 401)
module.exports.authSessionTokenExpired = new ReqError(105, 'received session token expired', 401)
module.exports.authNoSessionToken = new ReqError(106, 'session token not received', 401)
module.exports.authNotSpecSession = new ReqError(107, 'received session token is not a spec token', 401)
module.exports.authNotUserSession = new ReqError(108, 'received session token is not a user token', 401)
module.exports.authNotUsers = new ReqError(109, "required object is not doesn't belong to the user", 401)

// route 200
module.exports.routeNotExist = new ReqError(200, "route doesn't exist", 404)
module.exports.routeNotExistSpec = new ReqError(201, "route doesn't exist for /spec", 404)
module.exports.routeNotExistUser = new ReqError(202, "route doesn't exist for /user", 404)
module.exports.routeNotExistAuthed = new ReqError(203, "route doesn't exist for /any", 404)

// notExist 300
module.exports.notExistError = new ReqError(300, 'object not exist error (general)', 400)
module.exports.notExistIdError = new ReqError(301, 'object not exist error (object with current id not exist)', 400)

// Validation 400
module.exports.validationError = new ReqError(400, 'validation error (general)', 400)
module.exports.validationIdError = new ReqError(401, 'validation error (invalid id)', 400)
module.exports.validationSymbolsError = new ReqError(402, 'validation error (invalid symbols)', 400)
module.exports.validationPhoneError = new ReqError(403, 'validation error (invalid phone format)', 400)
module.exports.validationPasswordError = new ReqError(404, 'validation error (invalid password format)', 400)
module.exports.validationFieldRequired = new ReqError(405, 'validation error (field is required)', 400)

// Option 500
module.exports.optionError = new ReqError(500, 'invalid option (general)', 400)
module.exports.optionMethodError = new ReqError(501, 'invalid option (invalid method id)', 400)
module.exports.optionSpecializationError = new ReqError(501, 'invalid option (invalid specialization id)', 400)

// Materials 1000
module.exports.materialsNoReader = new ReqError(1101, 'current user is not a reader of this material', 400)

// Reactions 1100
module.exports.reactionsAlreadyExist = new ReqError(1201, 'current user reaction is already exist', 400)
module.exports.reactionsNotExist = new ReqError(1202, 'current user reaction is not exist', 400)

// Classes 1300
module.exports.classesUnavailableTime = new ReqError(1301, 'received time is not available', 400)
module.exports.classesIdNotExist = new ReqError(1302, "can't find class with received id", 400)
module.exports.classesStateAlreadySet = new ReqError(1303, "the status has already been set", 400)

// Qualification 1400
module.exports.qualificationMaxLength = new ReqError(1401, "you can't add more education institutions", 400)