const {Router} = require('express')
const router = Router()

const {query} = require("express-validator");
const Class = require('../../db/Class')
const User = require('../../db/User')
const {validationHandler} = require("../../utils/validationHandler")
const {idValidator, requiredValidator} = require("../../utils/customValidators");
const {classesIdNotExist, classesStateAlreadySet, authNotUsers} = require("../../utils/errors");
const {successModified} = require("../../utils/statuses");

router.get('/getClasses',
    query(['date'], 'field is required')
        .not()
        .isEmpty()
    ,
    query('date')
        .isInt({min: 0})
        .toInt()
    ,
    query('timeOffset')
        .optional()
        .isInt({lt: 13, gt: -12})
        .toInt()
    ,
    validationHandler,
    (req, res, next) => {
        Class.getClassesOnDate(req.user_id, req.query.date, req.query.timeOffset)
            .then(data => res.json(data))
            .catch(err => next(err))
    })


router.delete('/cancelClass',
    query(['classId'])
        .custom(requiredValidator)
    ,
    query('classId')
        .custom(idValidator)
        .bail()
        .custom(async (v, {req}) => {
            return Class.findById(v)
                .then(data => {
                    if (!data) throw classesIdNotExist
                    if (data.owner.toString() !== req.user_id) throw authNotUsers
                    if (data.state) throw classesStateAlreadySet
                    return true
                })
        })
    ,
    validationHandler,
    (req, res, next) => {
        Class.cancelClass(req.query.classId, req.user_id)
            .then(() => {
                return User.incCancelled(req.user_id)
            })
            .then((data) => {
                res.json(successModified)
            })
            .catch(err => next(err))
    })

module.exports = router