const {Router} = require('express')
const router = Router()

const Class = require('../../db/Class')
const User = require('../../db/User')
const createError = require("http-errors");
const {query, validationResult} = require("express-validator");
const ReqError = require("../../modules/ReqError");


router.get('/bookingTimetable',
    query(['specId', 'date'], 'field is required')
        .not()
        .isEmpty()
    ,
    query('specId')
        .custom(v => {
            if (!/^[0-9a-fA-F]{24}$/.test(v)) throw new Error('Id is not valid')
            return true
        }),
    query('date')
        .isInt()
        .toInt()
    ,
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new ReqError(1, errors.array({onlyFirstError: true}), 400))
        }

        Promise.all([Class.getClassesByOwner(req.query.specId), User.getTimetable(req.query.specId)])
            .then(([classes, timetable]) => {
                const day = new Date(req.query.date).getDay() || 7

                res.json(timetable
                    .filter(time => {
                        return (time >= 24 * (day - 1) && time < 24 * day)
                    })
                    .map(time => time - (day - 1) * 24)
                    .filter(time => !classes.find(_class => _class.date === req.query.date && _class.time === time))
                    .sort((a, b) => a - b)
                )
            })
            .catch(err => next(err))

    })

router.get('/bookingData',
    query(['specId'], 'field is required')
        .not()
        .isEmpty()
    ,
    query('specId')
        .custom(v => {
            if (!/^[0-9a-fA-F]{24}$/.test(v)) throw new Error('Id is not valid')
            return true
        })
    ,
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new ReqError(1, errors.array({onlyFirstError: true}), 400))
        }

        User.findById(req.query.specId)
            .select({
                name: 1,
                surname: 1,
                methods: 1,
                specializations: 1,
                opportunities: 1,
                statistic: '$statistic.sessions'
            })
            .populate('methods specializations reviews')
            .then(data => res.json(
                {
                    ...data.toObject(),
                    rating: {
                        count: data.reviews.length,
                        stars: data.reviews.reduce((acc, el) => acc + el.stars, 0) / data.reviews.length
                    }
                }
            ))
            .catch(err => next(err))

    })

router.get('/', (req, res, next) => {
    Class
        .find(
            {
                is_private: true,
                participants: req.user_id,
                is_completed: false,
                date: {$gt: Date.now()}
            }
        )
        .sort({[req.query.sortby || 'start_date']: [Number.parseInt(req.query.sortdir) || 1]})
        .limit(req.query.limit || 5)
        .populate('owner', 'name surname avatar')
        .then(data => {
            res.json(data)
        })
        .catch(err => next(err))
})


router.delete('/', (req, res, next) => {
    Class
        .findOneAndDelete(
            {
                is_private: true,
                participants: req.user_id,
                _id: req.body.id
            }
        )
        .then(data => {
            User.updateOne({_id: req.user_id}, {$inc: {'statistic.sessions.cancelled': 1}}).then().catch()
            res.json(data)
        })
        .catch(err => next(err))

})

router.put('/', (req, res, next) => {
    const date = new Date(req.body.date)
    User.count({
        _id: req.body.owner,
        [`timetable.${date.getDay()}`]: {$in: req.body.time},
    })
        .then(data => {
            if (!data) next(createError('the schedule is not available for a specialist'))
            else Class.count(
                {
                    owner: req.body.owner,
                    is_private: true,
                    date: {$gte: date.setUTCHours(0, 0, 0, 0), $lte: date.setUTCHours(23, 59, 59, 999)},
                    time: req.body.time
                })
                .then(data => {
                    if (data) next(createError('records for this time already exist'))
                    else Class.create({
                        owner: req.body.owner,
                        description: req.body.description,
                        date: date.setUTCHours(0, 0, 0, 0) + Math.min(...req.body.time) * 15 * 60 * 1000,
                        participants: [req.user_id],
                        link: req.body.link,
                        time: req.body.time
                    })
                        .then(data => {
                            res.json(data)
                        })
                        .catch(err => next(err))
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
})

module.exports = router
