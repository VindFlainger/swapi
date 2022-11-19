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
        create_date: {
            type: Number,
            default: Date.now()
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
            cancelled: {
                type: Boolean,
                default: false
            },
            confirmed: {
                type: Boolean,
                default: false
            },
            missed: {
                type: Boolean,
                default: false
            },
        },
    },
    {
        statics: {
            getClassesByOwner(id) {
                return this.find({owner: id})
            },
            getClassesByParticipant(id) {
                return this.find({participant: id})
            }
        },
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
)


module.exports = db.model('Class', schema, 'classes')