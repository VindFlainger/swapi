const db = require('./index')


const schema = new db.Schema(
    {
        owner: {
            type: db.Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        },
        participant: {
            type: db.Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        },
        date: {
            type: Number,
            required: true
        },
        time: {
            type: Number,
            max: 23,
            min: 0,
            required: true,
        },
        method: {
            type: db.Schema.Types.ObjectId,
            ref: 'method'
        },
        specialization: {
            type: db.Schema.Types.ObjectId,
            ref: 'specialization'
        },
        opportunities: {
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
            },
            internal: {
                type: Boolean,
                default: false
            }
        },
        state: {
            type: String,
            default: null,
            enum: ['cancelled', 'confirmed', 'missed', null]
        },
    },
    {
        statics: {
            getClassesByOwner(id) {
                return this.find({owner: id})
            },
            getClassesByParticipant(id) {
                return this.find({participant: id})
            },
            createClass(ownerId, participantId, date, time, timeOffset, method, specialization, opportunities) {
                const _date = new Date(date).setUTCHours(0, 0, 0, 0)
                const yDate = new Date(date).setUTCHours(-24, 0, 0, 0) // yesterday date
                const tDate = new Date(date).setUTCHours(24, 0, 0, 0) // tomorrow date


                return this.create({
                    owner: ownerId,
                    participant: participantId,
                    date: timeOffset >= 0 ? time < timeOffset ? yDate : _date : time >= 24 + timeOffset ? tDate : _date,
                    time: timeOffset >= 0 ? (((time - timeOffset) % 24) + 24) % 24 : (((time - timeOffset) % 24) + 24) % 24,
                    method,
                    specialization,
                    opportunities
                })
            },
            cancelClass(classId, userId) {
                return this.updateOne({
                    owner: userId,
                    _id: classId,
                    state: null
                }, {
                    $set: {
                        state: 'cancelled'
                    }
                })
            },
            getTimetableOnDate(userId, date, timeOffset) {
                const _date = new Date(date).setUTCHours(0, 0, 0, 0)
                const yDate = new Date(date).setUTCHours(-24, 0, 0, 0) // yesterday date
                const tDate = new Date(date).setUTCHours(24, 0, 0, 0) // tomorrow date
                return this
                    .find(
                        {
                            owner: userId,
                            date:
                                {
                                    $in: [_date, timeOffset < 0 ? tDate : yDate]
                                }
                        })
                    .select({
                        date: 1,
                        time: 1
                    })
                    .then(data => {
                        if (timeOffset >= 0) {
                            return data
                                .filter(el => {
                                    if (el.date === _date && el.time < 24 - timeOffset) return true
                                    else return el.date === yDate && el.time >= 24 - timeOffset
                                })
                                .map(el => {
                                    return {
                                        ...el.toObject(),
                                        time: (el.time + timeOffset) % 24,
                                        date: _date
                                    }
                                })
                                .sort((a, b) => a.time - b.time)
                        } else {
                            return data
                                .filter(el => {
                                    if (el.date === _date && el.time > timeOffset) return true
                                    else return el.date === tDate && el.time < -timeOffset
                                })
                                .map(el => {
                                    return {
                                        ...el.toObject(),
                                        time: (((el.time + timeOffset) % 24) + 24) % 24,
                                        date: _date
                                    }
                                })
                                .sort((a, b) => a.time - b.time)
                        }
                    })
            },
            getClassesOnDate(userId, date, timeOffset) {
                const _date = new Date(date).setUTCHours(0, 0, 0, 0)
                const yDate = new Date(date).setUTCHours(-24, 0, 0, 0) // yesterday date
                const tDate = new Date(date).setUTCHours(24, 0, 0, 0) // tomorrow date
                return this
                    .find(
                        {
                            owner: userId,
                            date:
                                {
                                    $in: [_date, timeOffset < 0 ? tDate : yDate]
                                }
                        })
                    .select({
                        date: 1,
                        time: 1,
                        method: 1,
                        specialization: 1,
                        opportunities: 1,
                        state: 1
                    })
                    .populate([
                        {
                            path: 'participant',
                            select: {
                                name: 1,
                                surname: 1,
                                email: 1,
                                avatar: 1
                            },
                            populate: {
                                path: 'avatar',
                                select: {
                                    id: 0,
                                    _id: 0
                                }
                            }
                        },
                        {
                            path: 'method'
                        },
                        {
                            path: 'specialization'
                        }
                    ])
                    .then(data => {
                        if (timeOffset >= 0) {
                            return data
                                .filter(el => {
                                    if (el.date === _date && el.time < 24 - timeOffset) return true
                                    else return el.date === yDate && el.time >= 24 - timeOffset
                                })
                                .map(el => {
                                    return {
                                        ...el.toObject(),
                                        time: (el.time + timeOffset) % 24,
                                        date: _date
                                    }
                                })
                                .sort((a, b) => a.time - b.time)
                        } else {
                            return data
                                .filter(el => {
                                    if (el.date === _date && el.time > timeOffset) return true
                                    else return el.date === tDate && el.time < -timeOffset
                                })
                                .map(el => {
                                    return {
                                        ...el.toObject(),
                                        time: (((el.time + timeOffset) % 24) + 24) % 24,
                                        date: _date
                                    }
                                })
                                .sort((a, b) => a.time - b.time)
                        }
                    })
            }
        },
        toJSON: {
            virtuals: true,
            versionKey: false
        },
        toObject: {
            virtuals: true,
            versionKey: false
        },
        timestamps: {
            createdAt: true,
            updatedAt: false
        }
    },
)


module.exports = db.model('Class', schema, 'classes')