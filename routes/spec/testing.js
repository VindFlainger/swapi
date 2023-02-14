const {Router} = require('express')
const {body} = require("express-validator");
const Test = require("../../db/Test");
const {validationHandler} = require("../../utils/validationHandler");
const mongoose = require("mongoose");

const router = Router()

router.post('/createTest',
    body(['questions'], 'field is required'),
    body('questions')
        .isArray()
    ,
    body('questions')
        .isArray({min: 1, max: 100})
        .toArray()
    ,
    body('afterwords')
        .isLength({max: 1000}),
    body('questions.*.inputType')
        .isIn(['radio', 'checkbox', 'input']),
    body('questions.*.question')
        .notEmpty(),
    validationHandler,

    (req, res, next) => {
        Test.createTest(req.body.questions, req.body.afterwords, req.body.cleverAfterwords)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                console.log(err.errors['questions'].properties)
                next(err)
            })
    })

module.exports = router
