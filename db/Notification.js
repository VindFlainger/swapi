const db = require('./index')
const ObjectId = require('mongoose').Types.ObjectId

const booking = new db.Schema({
    user: {
        type: db.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    date: {
        type: Number,
        required: true
    },
    method: {
        type: db.Schema.Types.ObjectId,
        ref: 'method',
        required: true
    },
    specialization: {
        type: db.Schema.Types.ObjectId,
        ref: 'specialization',
        required: true
    },
    opportunities: {
        internal: {
            type: Boolean,
            default: false
        },
        teens: {
            type: Boolean,
            default: false
        },
        family: {
            type: Boolean,
            default: false
        },
        children: {
            type: Boolean,
            default: false
        }
    },
    _id: false
})

const message = new db.Schema({
    title: {
        type: String,
        maxlenght: 50,
    },
    text: {
        type: String,
        maxlenght: 500,
        required: true
    },
    url: {
        type: String,
        maxlenght: 256,
    },
    icon: {
        type: String,
        maxlenght: 128,
    }
})

const media = new db.Schema({
    title: {
        type: String,
        maxlenght: 50,
    },
    text: {
        type: String,
        maxlenght: 500,
        required: true
    },
    url: {
        type: String,
        maxlenght: 128,
    },
    icon: {
        type: String,
        maxlenght: 128,
    },
    img: {
        type: db.Schema.Types.ObjectId,
        ref: 'img',
    },
    documents: {
        type: [{
            type: db.Schema.Types.ObjectId,
            ref: 'file'
        }]
    }
})


const schema = new db.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['booking', 'text', 'media']
        },
        receiver: {
            type: db.Schema.Types.ObjectId
        },
        witnesses: {
            type: [{
                type: db.Schema.Types.ObjectId,
                ref: 'user'
            }]
        },
        group: {
            type: String,
            enum: ['spec', 'user', 'any']
        },
        content: {
            booking: {
                type: booking,
                required: false
            },
            message: {
                type: message,
                required: false
            },
            media: {
                type: media,
                required: false
            }
        }
    }, {
        statics: {
            addBookingNotification(specId, userId, date, method, specialization, opportunities) {
                return this.create({
                    type: 'booking',
                    receiver: specId,
                    content: {
                        booking: {
                            user: userId,
                            date,
                            method,
                            specialization,
                            opportunities
                        }
                    }
                })
            },
            markAsRead(id, userId, role) {
                return this.updateOne({
                        _id: id,
                        $or: [
                            {
                                receiver: ObjectId(userId)
                            },
                            {
                                group: {$in: [role, 'any']}
                            },
                        ],
                    },
                    {
                        $addToSet: {
                            witnesses: userId
                        }
                    })
            },
            getNewCount(userId, role) {
                return this.count({
                    $or: [
                        {
                            receiver: ObjectId(userId)
                        },
                        {
                            group: {$in: [role, 'any']}
                        },
                    ],
                    witnesses: {
                        $ne: userId
                    }
                })
            },
            getAll(userId, role, range = {offset: 0, limit: 30}) {
                return this.aggregate([
                    {
                        $match: {
                            $or: [
                                {
                                    receiver: ObjectId(userId)
                                },
                                {
                                    group: {$in: [role, 'any']}
                                },
                            ]
                        }
                    },
                    {
                        $addFields: {
                            witnesses: {
                                $filter: {
                                    input: '$witnesses',
                                    as: 'witness',
                                    cond: {
                                        $eq: [
                                            '$$witness',
                                            ObjectId(userId)
                                        ]
                                    }
                                }
                            },
                        }
                    },
                    {
                        $addFields: {
                            read: {
                                $eq: [
                                    {$size: '$witnesses'},
                                    1
                                ]
                            },
                        }
                    },
                    {
                        $project: {
                            witnesses: 0
                        }
                    },
                    {
                        $sort: {
                            createdAt: -1
                        }
                    }
                ])
                    .skip(range.offset)
                    .limit(range.limit)
                    .then(data => {
                        return this.populate(data, [
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
                            },
                            {
                                path: 'content.media.img'
                            },
                            {
                                path: 'content.media.documents'
                            },

                        ])
                    })
            }
        },
        timestamps: {
            createdAt: true,
            updatedAt: false
        },
        versionKey: false,
    }
)

module.exports = db.model('notification', schema, 'notifications')