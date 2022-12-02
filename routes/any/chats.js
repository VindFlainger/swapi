const {Router, json} = require('express')
const router = Router()

const Message = require("../../db/Message");
const {query, body} = require("express-validator");
const validationHandler = require('../../modules/validationHandler')
const {idValidator} = require("../../modules/customValidators");
const ObjectId = require("mongoose").Types.ObjectId;


router.post('/sendMessage',
    body(['text', 'userId'], 'field is required'),
    body('userId')
        .custom(idValidator)
    ,
    body('text')
        .isLength({min: 1})
    ,
    validationHandler,
    (req, res, next) => {
        Message.sendMessage(req.user_id, req.body.userId, req.body.text)
            .then(data => res.json(data))
            .catch(err => next(err))
    })

router.get('/readOffset',
    query('userId')
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        Message.getReadOffset(req.user_id, req.query.userId)
            .then(count => res.json(count))
            .catch(err => next(err))
    })

router.get('/viewedOffset',
    query('userId')
        .custom(idValidator)
    ,
    validationHandler, (req, res, next) => {
        Message.getViewedOffset(req.user_id, req.query.userId)
            .then(data => res.json(data))
            .catch(err => next(err))
    }
)

router.get('/offsets',
    query('userId')
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        Promise.all([Message.getReadOffset(req.user_id, req.query.userId), Message.getViewedOffset(req.user_id, req.query.userId)])
            .then(data => res.json({
                readOffset: data[0],
                viewedOffset: data[1]
            }))
            .catch(err => next(err))
    })

router.put('/readOffset',
    body('userId')
        .custom(idValidator)
    ,
    body('offset')
        .isInt({min: 0})
    ,
    validationHandler,
    (req, res, next) => {
        Message.setReadOffset(req.user_id, req.body.userId, req.body.offset)
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })


router.get('/allNewMessagesCount', (req, res, next) => {
    Message.getAllNewMessagesCount(req.user_id)
        .then(count => res.json(count))
        .catch(err => next(err))
})


router.get('/messages',
    query('offset')
        .default(0)
        .isInt()
        .toInt()
    ,
    query('limit')
        .default(30)
        .isInt({min: 1, max: 50})
        .toInt()
    ,
    query('userId')
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        Message.find({
            $or: [
                {
                    from: ObjectId(req.user_id),
                    to: ObjectId(req.query.userId)
                },
                {
                    from: ObjectId(req.query.userId),
                    to: ObjectId(req.user_id)
                }
            ]
        })
            .select({
                to: 1,
                text: 1,
                createdAt: 1,
                offset: 1
            })
            .sort({
                createdAt: -1
            })
            .skip(req.query.offset)
            .sort({
                createdAt: 1
            })
            .limit(req.query.limit)
            .then(data => {
                Message.updateMany({
                        $and: [
                            {
                                $or: [
                                    {
                                        from: ObjectId(req.user_id),
                                        to: ObjectId(req.query.userId)
                                    },
                                    {
                                        from: ObjectId(req.query.userId),
                                        to: ObjectId(req.user_id)
                                    }
                                ]
                            },
                            {
                                offset: {
                                    $lte: req.query.offset + req.query.limit
                                }
                            }
                        ],
                    },
                    {
                        $set: {read: true}
                    })
                    .then(() => {
                        setTimeout(() => {
                            res.json(data)
                        }, 1000)
                    })
                    .catch(err => next(err))
            })
            .catch(err => next(err))
    })

router.get('/',
    query('offset')
        .default(0)
        .isInt({min: 0})
        .toInt()
    ,
    query('limit')
        .default(26)
        .isInt({min: 1, max: 50})
        .toInt()
    ,
    validationHandler,
    (req, res, next) => {
        Message.aggregate(
            [
                {
                    $match: {
                        $or: [
                            {
                                from: ObjectId(req.user_id)
                            },
                            {
                                to: ObjectId(req.user_id)
                            }
                        ]
                    }
                },
                {
                    $group: {
                        "_id": {
                            $cond: [
                                {
                                    $eq: [
                                        "$from",
                                        ObjectId(req.user_id)
                                    ]
                                },
                                "$to",
                                "$from"
                            ]
                        },
                        "new": {
                            $sum: {
                                $cond: {
                                    if: {
                                        $and: [
                                            {
                                                "$not": [
                                                    "$read"
                                                ],
                                            },
                                            {
                                                $eq: ['$to', ObjectId(req.user_id)]
                                            }
                                        ]
                                    },
                                    then: 1,
                                    else: 0
                                }
                            }
                        },
                        "last": {
                            $last: "$$ROOT"
                        },

                    }
                },
                {
                    $sort: {
                        'new': -1,
                        'last.createdAt': -1
                    }
                }
            ]
        )
            .skip(req.query.offset)
            .limit(req.query.limit)
            .project({
                    user: {
                        "$cond": {
                            if: {
                                "$eq": [
                                    "$last.from",
                                    ObjectId(req.user_id)
                                ]
                            },
                            "then": "$last.to",
                            "else": "$last.from"
                        }
                    },
                    last: 1,
                    new: 1,
                }
            )
            .then(
                data => {
                    return Message.populate(data, {
                            path: "user",
                            model: 'user',
                            select: {
                                name: 1,
                                surname: 1,
                                avatar: 1
                            },
                            populate: {
                                path: 'avatar',
                            }
                        }
                    )
                }
            )
            .then(data => {
                res.json(data)
            })
            .catch(err => next(err))
    })

module.exports = router
