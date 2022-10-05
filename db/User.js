const db = require('./index')


const document = new db.Schema({
    img: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: false
    }
})

const schema = new db.Schema({
        id: {
            type: Number,
            max: 300000000,
            min: 200000000,
            required: true,
            index: true,
            unique: true
        },
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
        birth: {
            type: Number,
            required: true
        },
        sex: {
            type: String,
            enum: ['not set', 'male', 'female'],
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'spec'],
            required: true
        },
        avatar: {
            type: String,
            required: false,
            maxlenght: 256,
        },
        about: {
            type: String,
            required: false,
            maxlenght: 3000
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
                maxlenght: 64,
                required: true
            },
            date: {
                type: Number,
                default: Date.now()
            }
        },
        sessions: [
            {
                date: {
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
                }
            }
        ],
        price: {
            type: Number,
            required: false
        },
        qualification: {
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
                    documents: [document],
                    approve: {
                        type: Boolean,
                        default: false
                    }
                }
            ],
            category: {
                name: {
                    type: String,
                    required: true,
                    maxlenght: 256
                },
                documents: [document],
                approve: {
                    type: Boolean,
                    default: false
                }
            },
            experience: {
                type: Number,
                default: 0
            }
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
        events: {
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
                    participants: [Number],
                    documents: [document],
                    approve: {
                        type: Boolean,
                        default: false
                    }
                }
            ],
            default: undefined
        },
        specialization: {
            type: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    id: {
                        type: Number,
                        required: true
                    }
                }
            ],
            default: undefined
        },
        favourites: {
            type: [Number],
            default: undefined
        }
    },
    {
        statics: {
            getShortInfo(...ids) {
                this
                    .find({id: {$in: [ids]}})
                    .projection({name: 1, surname: 1, avatar: 1})
            }
        },
        virtuals: {
            fullName: {
                get() {
                    return this.name + ' ' + this.surname
                }
            },
        },
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    })


module.exports = db.model('user', schema)