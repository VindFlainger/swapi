const {Router} = require('express')
const router = Router()
const Class = require('../../db/Class')
const User = require('../../db/User')
const Notification = require('../../db/Notification')
const createError = require("http-errors");
const {query, body} = require("express-validator");
const {idValidator, methodValidator, specializationValidator} = require("../../utils/customValidators");
const io = require('../../sockets/index')
const {validationHandler} = require("../../utils/validationHandler");
const {classesUnavailableTime} = require("../../utils/errors");

// TODO: rewrite all

router.get('/bookingTimetable',
    query(['specId', 'date'], 'field is required')
        .not()
        .isEmpty()
    ,
    query('specId')
        .custom(idValidator),
    query('date')
        .isInt()
        .toInt()
    ,
    query('specId')
        .custom(idValidator)
    ,
    query('timeOffset')
        .optional()
        .isInt({lt: 13, gt: -12})
        .toInt()
    ,
    validationHandler,
    (req, res, next) => {
        const day = new Date(req.query.date).getDay() || 7
        Promise.all([Class.getTimetableOnDate(req.query.specId, req.query.date, req.query.timeOffset), User.getTimetableOnDay(req.query.specId, day, req.query.timeOffset)])
            .then(([classes, timetable]) => {
                const availableTimetable = timetable
                    .filter(time => classes.every(cls => cls.time !== time))
                    .sort((a, b) => a - b)
                res.json(availableTimetable)
            })
            .catch(err => next(err))
    })

router.get('/bookingData',
    query(['specId'], 'field is required')
        .not()
        .isEmpty()
    ,
    query('specId')
        .custom(idValidator)
    , validationHandler,
    (req, res, next) => {
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

router.post('/booking',
    body(['specId', 'date', 'time', 'method', 'specialization'], 'field is required')
        .not()
        .isEmpty()
    ,
    body('specId')
        .custom(idValidator),
    body('date')
        .isInt()
        .toInt()
    ,
    body('method')
        .custom(methodValidator),
    body('specialization')
        .custom(specializationValidator),
    body('opportunities')
        .optional()
        .isArray({max: 4})
        .toArray()
    ,
    body('opportunities.*')
        .isIn(['teens', 'children', 'family', 'internal'])
    ,
    body('time')
        .isInt({min: 0, max: 23})
        .toInt()
    ,
    body('specId')
        .custom(idValidator)
    ,
    body('timeOffset')
        .optional()
        .isInt({lt: 13, gt: -12})
        .toInt()
    ,
    validationHandler,
    (req, res, next) => {
        const opportunities = {
            teens: !!req.body.opportunities?.includes('teens'),
            family: !!req.body.opportunities?.includes('family'),
            children: !!req.body.opportunities?.includes('children'),
            internal: !!req.body.opportunities?.includes('internal'),
        }

        const day = new Date(req.body.date).getDay() || 7

        Promise.all(
            [
                Class.getTimetableOnDate(req.body.specId, req.body.date, req.body.timeOffset),
                User.getTimetableOnDay(req.body.specId, day, req.body.timeOffset)
            ]
        )
            .then(([classes, timetable]) => {
                const availableTimetable = timetable
                    .filter(time => classes.every(cls => cls.time !== time))
                    .sort((a, b) => a - b)

                if (availableTimetable.includes(req.body.time)) {
                    Class.createClass(
                        req.body.specId,
                        req.user_id,
                        req.body.date,
                        req.body.time,
                        req.body.timeOffset,
                        req.body.method,
                        req.body.specialization,
                        opportunities
                    )
                        .then(() => {
                            return Notification.addBookingNotification(
                                req.body.specId,
                                req.user_id,
                                new Date(req.body.date).setUTCHours(req.body.time - req.body.timeOffset, 0, 0, 0),
                                req.body.method,
                                req.body.specialization,
                                opportunities
                            )
                        })
                        .then(data => {
                            if (io.users.get(req.body.specId)) {
                                return Notification.populate(data, [
                                    {
                                        path: 'content.booking.user',
                                        select: {
                                            name: 1,
                                            surname: 1,
                                            avatar: 1,
                                        },
                                        populate: {
                                            path: 'avatar',
                                            select: {
                                                __v: 0,
                                                _id: 0
                                            }
                                        }
                                    },
                                    {
                                        path: 'content.booking.method'
                                    },
                                    {
                                        path: 'content.booking.specialization'
                                    }
                                ])
                            }
                        })
                        .then(notification => {
                            io.sockets.to(io.users.get(req.body.specId)).emit('notification:new', {
                                ...notification.toObject(), read: false
                            })
                        })
                        .catch()

                    res.json({success: true})
                } else {
                    next(classesUnavailableTime)
                }

            })
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
