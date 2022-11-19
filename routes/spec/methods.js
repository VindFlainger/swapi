const {Router} = require('express')
const router = Router()

const User = require("../../db/User");
const createError = require("http-errors");
const {body, validationResult} = require("express-validator");
const Method = require("../../db/Method");

router.get('/', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({methods: 1})
        .then(data => {
            res.json(data.methods)
        })
        .catch(err => next(createError(err)))
})

router.post('/',
    body(['methods'], 'field is required')
        .not()
        .isEmpty()
    ,
    body('methods')
        .custom(async v => {
            const methods = await Method.getMethods()
            if (!v.every(el => methods.includes(el))) throw new Error('unknown methods')
            return true
        }),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({error: errors.array({onlyFirstError: true})})
        }

        User
            .updateOne({_id: req.user_id}, {$set: {methods: req.body.methods}})
            .then(data => {
                res.json({success: true})
            })
            .catch(err => next(createError(err)))
    })

module.exports = router