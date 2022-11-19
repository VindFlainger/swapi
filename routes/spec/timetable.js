const {Router} = require('express')
const router = Router()

const User = require('../../db/User')
const createError = require("http-errors");
const {body, validationResult, query} = require("express-validator");
const ReqError = require("../../modules/ReqError");

router.post('/',
    body(['timetable'], 'field is required')
        .not()
        .isEmpty()
    ,
    body('timetable')
        .isArray({min: 0, max: 167})
    ,
    body('timetable.*')
        .isInt({max: 167, min: 0})
        .toInt()
    ,
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new ReqError(1, errors.array({onlyFirstError: true})), 400)
        }
        User
            .updateOne({_id: req.user}, {$set: {timetable: req.body.timetable}})
    })

router.get('/',
    (req, res, next) => {
        User
            .findOne({_id: req.user_id})
            .select({timetable: 1})
            .then(data => res.json(data.timetable))
            .catch(err => next(err))
    })

router.put('/',
    body(['time'], 'field is required')
        .not()
        .isEmpty()
    ,
    body('time')
        .isInt({min: 0, max: 167})
        .toInt()
    ,
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new ReqError(1, errors.array({onlyFirstError: true})), 400)
        }
        User
            .updateOne({_id: req.user_id}, {$addToSet: {timetable: req.body.time}})
            .then(()=> res.json({success: true}))
            .catch(err => next(err))

    })

router.delete('/',
    query(['time'], 'field is required')
        .not()
        .isEmpty()
    ,
    query('time')
        .isInt({min: 0, max: 167})
        .toInt()
    ,
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new ReqError(1, errors.array({onlyFirstError: true}), 400))
        }
        User
            .updateOne({_id: req.user_id}, {$pull: {timetable: req.query.time}})
            .then(()=> res.json({success: true}))
            .catch(err => next(err))
    })

module.exports = router

