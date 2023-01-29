const {Router} = require('express')
const router = Router()

const User = require("../../db/User");
const {body} = require("express-validator");
const {successModified} = require("../../modules/statuses");
const {validationHandler} = require("../../modules/validationHandler");

router.get('/', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({opportunities: 1})
        .then(data => {
            res.json(data.opportunities)
        })
        .catch(err => next(err))
})

router.post('/',
    body(['internal', 'children', 'teens', 'family'], 'field is required')
        .optional()
        .isBoolean()
    ,
    validationHandler,
    (req, res, next) => {
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
            .then(() => {
                res.json(successModified)
            })
            .catch(err => next(err))
    })

module.exports = router