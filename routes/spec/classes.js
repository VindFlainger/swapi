const {Router} = require('express')
const router = Router()

const {query} = require("express-validator");
const Class = require('../../db/Class')
const ReqError = require("../../utils/ReqError");
const {validationHandler} = require("../../utils/validationHandler")


router.get('',
    query(['date'], 'field is required')
        .not()
        .isEmpty()
    ,
    query('date')
        .isInt()
        .toInt()
    ,
    query('timeOffset')
        .optional()
        .isInt({lt: 13, gt: -12})
        .toInt()
    ,
    validationHandler,
    (req, res, next) => {
        if (!req.query.timeOffset) {
            Class.find({owner: req.user_id, date: req.query.date})
                .sort({time: 1})
                .populate({
                    path: 'participant',
                    select: {
                        name: 1,
                        surname: 1,
                        avatar: 1,
                        email: 1,
                    },
                    populate: {
                        path: 'avatar',
                    }
                })
                .then(data => {
                    res.json(data)
                })
                .catch()
        } else {
            const yDate = new Date(req.query.date).setUTCHours(-24, 0, 0, 0) // yesterday date
            const tDate = new Date(req.query.date).setUTCHours(24, 0, 0, 0) // tomorrow date
            Class
                .find({owner: req.user_id, date: {$in: [req.query.date, req.query.timeOffset < 0 ? tDate : yDate]}})
                .populate({
                    path: 'participant',
                    select: {
                        name: 1,
                        surname: 1,
                        avatar: 1,
                        email: 1,
                    },
                    populate: {
                        path: 'avatar',
                    }
                })
                .then(data => {
                    if (req.query.timeOffset > 0) {
                        res.json(
                            data
                                .filter(el => {
                                    if (el.date === req.query.date && el.time < 24 - req.query.timeOffset) return true
                                    else return el.date === yDate && el.time >= 24 - req.query.timeOffset
                                })
                                .map(el => {
                                    return {
                                        ...el.toObject(),
                                        time: (el.time + req.query.timeOffset) % 24,
                                        date: req.query.date
                                    }
                                })
                                .sort((a, b) => a.time - b.time)
                        )
                    } else {
                        res.json(
                            data
                                .filter(el => {
                                    if (el.date === req.query.date && el.time > req.query.timeOffset) return true
                                    else return el.date === tDate && el.time < -req.query.timeOffset
                                })
                                .map(el => {
                                    return {
                                        ...el.toObject(),
                                        time: (((el.time + req.query.timeOffset) % 24) + 24) % 24,
                                        date: req.query.date
                                    }
                                })
                                .sort((a, b) => a.time - b.time)
                        )
                    }
                })
                .catch(err => next(err))
        }

    })


router.delete('',
    query(['id'], 'field is required')
        .not()
        .isEmpty()
    ,
    query('id')
        .custom(v => {
            if (!/^[0-9a-fA-F]{24}$/.test(v)) throw new Error('Id is not valid')
            return true
        })
    ,
    validationHandler,
    (req, res, next) => {
        Class.findOneAndDelete({owner: req.user_id, _id: req.query.id})
            .then(data => {
                if (data) res.json({success: true})
                else next(new ReqError(3, 'no data', 400))
            })
    })

module.exports = router