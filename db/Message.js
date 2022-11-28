const db = require('./index')


const schema = new db.Schema(
    {
        _id: db.Schema.Types.ObjectId,
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
    },
    {
        versionKey: false,
        timestamps: true
    }

)

module.exports = db.model('message', schema, 'messages')