const {Router} = require('express')
const router = Router()

const User = require("../../db/User");
const {body} = require("express-validator");
const {specializationValidator} = require("../../utils/customValidators");
const {validationHandler} = require("../../utils/validationHandler");

router.get('/', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({specializations: 1})
        .then(data => {
            res.json(data.specializations)
        })
        .catch(err => next(err))
})

router.post('/',
    body(['specializations'], 'field is required')
        .not()
        .isEmpty()
    ,
    body('specializations')
        .custom(specializationValidator),
    validationHandler,
    (req, res, next) => {
        User
            .updateOne({_id: req.user_id}, {$set: {specializations: req.body.specializations}})
            .then(data => {
                res.json({success: true})
            })
            .catch(err => next(err))
    })

module.exports = router