const {Router} = require('express')
const router = Router()

const User = require("../../db/User");
const createError = require("http-errors");
const {body, validationResult} = require("express-validator");

router.get('/', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({opportunities: 1})
        .then(data => {
            res.json(data.opportunities)
        })
        .catch(err => next(createError(err)))
})

router.post('/',
    body(['internal', 'children', 'teens', 'family'], 'field is required')
        .optional()
        .isBoolean()
    ,
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({error: errors.array({onlyFirstError: true}), code: 1})
        }

        User
            .updateOne({_id: req.user_id},
                {
                    $set:
                        {
                            'opportunities.teens': req.body.teens,
                            'opportunities.internal': req.body.internal,
                            'opportunities.children': req.body.children,
                            'opportunities.family': req.body.family
                        }
                }
            )
            .then(data => {
                res.json({success: true})
            })
            .catch(err => next(createError(err)))
    })

module.exports = router