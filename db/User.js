const db = require('./index')
const e = require("express");


const document = new db.Schema({
    img: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: false
    },
    _id: false,
})


const schema = new db.Schema({
        name: {
            type: String,
            maxlenght: 20,
            required: true
        },
        surname: {
            type: String,
            maxlenght: 20,
            required: true
        },
        number: {
            type: String,
            maxlenght: 13,
            required: false
        },
        email: {
            type: String,
            maxlenght: 256,
            required: true
        },
        sex: {
            type: String,
            enum: ['none', 'male', 'female'],
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'spec'],
            required: true
        },
        avatar: {
            type: db.Schema.Types.ObjectId,
            required: false,
            ref: 'avatar'
        },
        about: {
            type: {
                short: {
                    type: String,
                    maxlenght: 400
                },
                full: {
                    type: String,
                    maxlenght: 1000
                }
            },
            _id: false,
            required: false,
        },
        statistic: {
            sessions: {
                confirmed: {
                    type: Number,
                    required: false
                },
                missed: {
                    type: Number,
                    required: false
                },
                cancelled: {
                    type: Number,
                    required: false
                }
            }
        },
        registration: {
            email: {
                type: String,
                maxlenght: 256,
                required: true
            },
            password: {
                type: String,
                required: true
            },
            date: {
                type: Number,
                default: Date.now()
            }
        },
        sessions: [
            {
                _id: false,
                date: {
                    type: Number,
                    default: Date.now()
                },
                activity: {
                    type: Number,
                    default: Date.now()
                },
                ip: {
                    type: String,
                    required: true,
                    maxlenght: 15
                },
                device: {
                    type: String,
                    required: true,
                    maxlenght: 256
                },
                token: {
                    type: String,
                    required: true,
                    maxlenght: 256
                }
            }
        ],
        price: {
            type: {
                online: {
                    min: {
                        type: Number,
                        required: true,
                        max: 10000
                    },
                    max: {
                        type: Number,
                        required: true,
                        max: 10000
                    }
                },
                internal: {
                    min: {
                        type: Number,
                        required: true,
                        max: 10000
                    },
                    max: {
                        type: Number,
                        required: true,
                        max: 10000
                    }
                },
            },
            _id: false,
            required: false
        },
        qualification: {
            type: {
                education: [
                    {
                        institution: {
                            type: String,
                            required: true,
                            maxlenght: 255
                        },
                        graduation: {
                            type: Number,
                            required: true,
                        },
                        documents: {
                            type: [db.Schema.Types.ObjectId],
                            ref: 'file'
                        },
                        approve: {
                            type: Boolean,
                            default: false
                        },
                        watched: {
                            type: Number,
                            default: 0
                        },
                    }
                ],
                category: {
                    name: {
                        type: String,
                        maxlenght: 256
                    },
                    documents: {
                        type: [db.Schema.Types.ObjectId],
                        ref: 'file'
                    },
                    approve: {
                        type: Boolean,
                        default: false
                    },
                    watched: {
                        type: Number,
                        default: 0
                    },
                },
            },
            _id: false,
            required: false
        },
        confirmation: {
            type: [
                {
                    name: {
                        type: String,
                        required: true,
                        maxlenght: 64
                    },
                    img: {
                        type: String,
                        required: true,
                        maxlenght: 256,
                    },
                    date: {
                        type: Number,
                        required: true
                    },
                    documents: [document],
                    approve: {
                        type: Boolean,
                        default: false
                    }

                }
            ],
            default: undefined
        },
        specializations: {
            type: [{
                type: db.Schema.Types.ObjectId,
                maxlenght: 30,
                required: true,
                ref: 'specialization'
            }],
            default: undefined
        },
        methods: {
            type: [{
                type: db.Schema.Types.ObjectId,
                maxlenght: 30,
                required: true,
                ref: 'method'
            }],
            default: undefined
        },
        timetable: {
            type: [{
                type: Number,
                max: 167,
                min: 0
            }],
            _id: false,
            default: undefined
        },
        opportunities: {
            type: {
                internal: {
                    type: Boolean,
                    default: false
                },
                children: {
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
                }
            },
            _id: false,
            required: false
        },
        contacts: {
            type: {
                phone: {
                    type: String,
                },
                messengers: [
                    {
                        type: String,
                        enum: ['vk', 'viber', 'telegram', 'whatsapp'],
                    }
                ],
                links: [
                    {
                        name: {
                            type: String,
                            required: true,
                            enum: ['vk', 'viber', 'telegram', 'whatsapp', 'instagram', 'facebook']
                        },
                        link: {
                            type: String,
                            required: true,
                            maxlenght: 30
                        },
                        _id: false
                    },
                ],
                address: {
                    type: String,
                    maxlenght: 120
                },
                connection: {
                    type: String,
                    maxlenght: 120
                }
            },
            _id: false,
            required: false
        },
        privileges: {
            type: {
                premium: {
                    type: Number,
                    default: 0
                },
                medals: [{
                    type: String,
                    enum: ['odmen']
                }]
            },
            _id: false,
            required: false

        },
        favourites: {
            type: [Number],
            default: undefined
        }

    },
    {
        statics: {
            getEmails() {
                return this
                    .distinct('registration.email')
            },
            getPassword(email) {
                return this.findOne({'registration.email': email})
                    .then(data => data?.registration?.password)
            },
            getPasswordRole(email) {
                return this.findOne({'registration.email': email})
                    .then(data => data ? {role: data.role, password: data.registration.password} : null)
            },
            getTimetable(id) {
                return this.findById(id)
                    .then(data => data?.timetable || null)
            },
            addSession(email, device, ip, token) {
                console.log(email, device, ip, token)
                return this.bulkWrite([
                    {
                        updateOne:
                            {
                                filter: {'registration.email': email},
                                update: {
                                    $pull:
                                        {
                                            sessions: {device}
                                        }
                                }
                            }
                    },
                    {
                        updateOne: {
                            filter: {'registration.email': email},
                            update: {
                                $push: {
                                    sessions: {
                                        device,
                                        ip,
                                        token,
                                        activity: Date.now(),
                                        date: Date.now()
                                    }
                                }
                            }
                        }
                    }
                ])
            },
            checkToken(email, token) {
                return this.findOneAndUpdate(
                    {
                        'registration.email': email, 'sessions.token': token
                    },
                    {
                        $set:
                            {
                                'sessions.$.activity': Date.now()
                            }
                    }
                )
            },
            changePassword(email, newPassword) {
                return this.updateOne({'registration.email': email}, {$set: {'registration.password': newPassword}})
            },
            deleteAllSessions(email) {
                return this.updateOne({'registration.email': email}, {$set: {sessions: []}})
            }
        },
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    })

schema.virtual('reviews', {
    ref: 'review',
    localField: '_id',
    foreignField: 'owner',
})


module.exports = db.model('user', schema)

