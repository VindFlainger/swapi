const {Router} = require('express')
const router = Router()

const User = require("../../db/User");
const createError = require("http-errors");
const {body, validationResult} = require("express-validator");
const Specialization = require("../../db/Specialization");

router.get('/', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({specializations: 1})
        .then(data => {
            res.json(data.specializations)
        })
        .catch(err => next(createError(err)))
})

router.post('/',
    body(['specializations'], 'field is required')
        .not()
        .isEmpty()
    ,
    body('specializations')
        .custom(async v => {
            const specializations = await Specialization.getSpecializations()
            if (!v.every(el => specializations.includes(el))) throw new Error('unknown specializations')
            return true
        }),
    (req, res, next) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({error: errors.array({onlyFirstError: true})})
        }

        User
            .updateOne({_id: req.user_id}, {$set: {specializations: req.body.specializations}})
            .then(data => {
                res.json({success: true})
            })
            .catch(err => next(createError(err)))
    })

module.exports = router