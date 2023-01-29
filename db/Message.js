const db = require('./index')
const ObjectId = require('mongoose').Types.ObjectId


const schema = new db.Schema(
    {
        from: {
            type: db.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        to: {
            type: db.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        visible: {
            from: {
                type: Boolean,
                default: true
            },
            to: {
                type: Boolean,
                default: true
            }
        },
        text: {
            type: String,
            maxlenght: 1000,
            required: true
        },
        read: {
            type: Boolean,
            default: false,
        },
        offset: {
            type: Number,
            required: true
        }
    },
    {
        versionKey: false,
        timestamps: true,
        statics: {
            getOffset(fUserId, sUserId) {
                return this.count(
                    {
                        $or: [
                            {
                                from: ObjectId(fUserId),
                                to: ObjectId(sUserId)
                            },
                            {
                                from: ObjectId(sUserId),
                                to: ObjectId(fUserId),
                            }
                        ]
                    }
                )
            },
            getReadOffset(userId, targetId) {
                return this.count(
                    {
                        $or: [
                            {
                                from: ObjectId(userId),
                                to: ObjectId(targetId)
                            },
                            {
                                from: ObjectId(targetId),
                                to: ObjectId(userId),
                                read: true
                            }
                        ]
                    }
                )
                    .then(count => count ? count - 1 : 0)
            },
            getLastOffset(userId, targetId) {
                return this.count(
                    {
                        $or: [
                            {
                                from: ObjectId(userId),
                                to: ObjectId(targetId)
                            },
                            {
                                from: ObjectId(targetId),
                                to: ObjectId(userId),
                            }
                        ]
                    }
                )
                    .then(count => count ? count - 1 : 0)
            },
            setReadOffset(userId, targetId, offset) {
                return this.updateMany(
                    {
                        from: ObjectId(targetId),
                        to: ObjectId(userId),
                        offset: {$lte: offset},
                        read: false
                    },
                    {
                        $set: {read: true}
                    })
            },
            getViewedOffset(userId, targetId) {
                return this.count({
                    $or: [
                        {
                            from: ObjectId(userId),
                            to: ObjectId(targetId)
                        },
                        {
                            from: ObjectId(targetId),
                            to: ObjectId(userId)
                        },
                    ]
                    ,
                    read: true
                })
                    .then(count => count ? count - 1 : 0)
            },
            getAllNewMessagesCount(userId) {
                return this.count({
                    to: ObjectId(userId),
                    read: false
                })
            },
            sendMessage(userId, targetId, text) {
                return this.getOffset(userId, targetId)
                    .then(offset => {
                        return Promise.all([Promise.resolve(offset), this.setReadOffset(userId, targetId, offset)])
                    })
                    .then(([offset]) => {
                        return this.create({
                            from: userId,
                            to: targetId,
                            text: text,
                            offset
                        })
                    })
                    .then(data =>
                        ({
                            ...data.toObject(),
                            visible: undefined,
                            updatedAt: undefined
                        })
                    )
            },
        }
    }
)

module.exports = db.model('message', schema, 'messages')