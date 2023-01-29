const {Router} = require('express')
const router = Router()

const User = require("../../db/User");
const {body, } = require("express-validator");
const {successModified} = require("../../modules/statuses");
const {validationHandler} = require("../../modules/validationHandler");
const {methodValidator} = require("../../modules/customValidators");

router.get('/', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({methods: 1})
        .then(data => {
            res.json(data.methods)
        })
        .catch(err => next(err))
})

router.post('/',
    body(['methods'], 'field is required')
        .not()
        .isEmpty()
    ,
    body('methods')
        .custom(methodValidator),
    validationHandler,
    (req, res, next) => {
        User
            .updateOne({_id: req.user_id}, {$set: {methods: req.body.methods}})
            .then(data => {
                res.json(successModified)
            })
            .catch(err => next(err))
    })

module.exports = router