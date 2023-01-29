const ReqError = require("./ReqError");
const Method = require("../db/Method");
const Specialization = require('../db/Specialization')
const {
    validationIdError, validationSymbolsError, optionMethodError, optionSpecializationError, validationPhoneError,
    validationPasswordError
} = require("./errors");

module.exports.idValidator = v => {
    if (!/^[0-9a-fA-F]{24}$/.test(v)) throw validationIdError
    return true
}

module.exports.textValidator = v => {
    if (!/^[0-9a-zA-ZА-я=!@# %:ё^*()&+-,. ]*$/.test(v)) throw validationSymbolsError
    return true
}

module.exports.phoneValidator = v => {
    if (!/375[(33)(29)(44)(25)]{2}\d{7}/.test(v)) throw validationPhoneError
    return true
}

module.exports.passwordValidator = v => {
    if (!/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[!#$%&? "]).*$/.test(v)) throw validationPasswordError
    return true
}

module.exports.methodValidator = async v => {
    const elems = [v].flat()
    const methods = await Method.getMethods()
    if (!elems.every(el => methods.some(method => method.toString() === el))) throw optionMethodError
    return true
}

module.exports.specializationValidator = async v => {
    const elems = [v].flat()
    const specializations = await Specialization.getSpecializations()
    if (!elems.every(el => specializations.some(specialization => specialization.toString() === el))) throw optionSpecializationError
    return true
}

