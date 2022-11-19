const ReqError = require("./ReqError");
module.exports.idValidator = v => {
    if (!/^[0-9a-fA-F]{24}$/.test(v)) throw new Error('Id is not valid')
    return true
}

module.exports.textValidator = v => {
    if (!/^[0-9a-zA-ZА-я=!@# %^*()&+-,. ]*$/.test(v)) throw new ReqError(200, 'forbidden language or symbols')
    return true
}

