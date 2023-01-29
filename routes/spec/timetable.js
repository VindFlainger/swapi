const {Router} = require('express')
const router = Router()

const User = require('../../db/User')
const {body, query} = require("express-validator");
const {validationHandler} = require("../../modules/validationHandler");

router.get('/',
    query('timeOffset')
        .default(0)
        .isInt({lt: 13, gt: -12})
        .toInt()
    ,
    validationHandler,
    (req, res, next) => {
        User.getTimetable(req.user_id, req.query.timeOffset)
            .then(timetable => res.json(timetable))
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
    query('timeOffset')
        .default(0)
        .isInt({lt: 13, gt: -12})
        .toInt()
    , validationHandler,
    (req, res, next) => {
        User
            .updateOne(
                {_id: req.user_id},
                {
                    $addToSet: {
                        timetable: (((req.body.time - req.body.timeOffset) % 168) + 168) % 168
                    }
                }
            )
            .then(() => res.json({success: true}))
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
    query('timeOffset')
        .default(0)
        .isInt({lt: 13, gt: -12})
        .toInt()
    ,
    validationHandler,
    (req, res, next) => {
        User
            .updateOne(
                {_id: req.user_id},
                {
                    $pull: {
                        timetable: (((req.body.time - req.body.timeOffset) % 168) + 168) % 168
                    }
                }
            )
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })

module.exports = router

