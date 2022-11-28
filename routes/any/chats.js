const {Router, json} = require('express')
const router = Router()

const Message = require("../../db/Message");
const {query} = require("express-validator");
const validationHandler = require('../../modules/validationHandler')
const {idValidator} = require("../../modules/customValidators");
const ObjectId = require("mongoose").Types.ObjectId;


router.get('/test', (req, res) => {
    Message.create({
        to: req.query.to,
        from: req.user_id,
        text: 'some payload',
    })
})

router.get('/send', (req, res) => {
    Message.updateOne()
})

router.get('/offset',
    query('userId')
        .custom(idValidator)
    ,
    validationHandler,
    (req, res) => {
        Message.count(
            {
                $or: [
                    {
                        from: ObjectId(req.user_id),
                        to: ObjectId(req.query.userId)
                    },
                    {
                        from: ObjectId(req.query.userId),
                        to: ObjectId(req.user_id),
                        read: true
                    }
                ]
            }
        ).then(count => res.json(count))
    })


router.get('/messages',
    query('offset')
        .default(0)
        .isInt()
        .toInt()
    ,
    query('limit')
        .default(26)
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
                read: 1,
                createdAt: 1
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
                const ids = data.map(el => el._id)
                Message.updateMany({
                        _id: {$in: [...ids]},
                        to: ObjectId(req.user_id)
                    },
                    {
                        $set: {read: true}
                    })
                    .then(() => {
                        res.json(data)
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
                        'last.read': -1,
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

